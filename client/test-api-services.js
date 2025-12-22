import axios from 'axios';

const BASE_URL = 'http://localhost:8888/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true // Don't throw on error status
});

let adminToken = '';
let adminUserId = '';
let testBookId = '';
let testPlaylistId = '';
let testOrderId = '';

// Helper to log results
const logResult = (testName, response, expectedStatus = 200) => {
  const status = response.status;
  const isSuccess = status === expectedStatus || (Array.isArray(expectedStatus) && expectedStatus.includes(status)) || (status === 204) || (response.data && response.data.code === 1000);
  
  if (isSuccess) {
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.log(`❌ [FAIL] ${testName} - Status: ${status}, Code: ${response.data?.code}, Message: ${response.data?.message}`);
    if (response.data) console.log('Response:', JSON.stringify(response.data, null, 2));
  }
  return isSuccess;
};

async function runTests() {
  console.log('🚀 Starting API Service Tests...\n');

  // ==========================================
  // 1. AUTH SERVICE
  // ==========================================
  console.log('--- Auth Service ---');

  // Login as Admin
  const loginRes = await api.post('/identity/auth/token', {
    username: 'admin',
    password: 'admin'
  });
  
  if (logResult('Login (Admin)', loginRes)) {
    adminToken = loginRes.data.result.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
  } else {
    console.error('🛑 Critical: Admin login failed. Aborting tests.');
    return;
  }

  // Get My Info
  const myInfoRes = await api.get('/identity/users/my-info');
  if (logResult('Get My Info', myInfoRes)) {
    adminUserId = myInfoRes.data.result.id;
  }
  
  // NOTE: Book Service expects Numeric ID, but Identity Service returns UUID.
  // We use a fake numeric ID for Book Service tests to verify functionality.
  const bookUserNumericId = 1;

  // ==========================================
  // 2. PROFILE SERVICE
  // ==========================================
  // ... (rest of the script)


  // ==========================================
  // 2. PROFILE SERVICE
  // ==========================================
  console.log('\n--- Profile Service ---');

  // Get My Profile
  // const myProfileRes = await api.get('/profile/users/my-profile');
  // logResult('Get My Profile', myProfileRes);

  // Search Users
  const searchUserRes = await api.post('/profile/users/search', { keyword: 'admin' });
  logResult('Search Users', searchUserRes);

  // ==========================================
  // 3. BOOK SERVICE
  // ==========================================
  console.log('\n--- Book Service ---');

  // Get All Books
  const getAllBooksRes = await api.get('/books?page=0&size=5');
  logResult('Get All Books', getAllBooksRes);

  // Create Book
  const newBook = {
    title: `Test Book ${Date.now()}`,
    author: 'Test Author',
    bookType: 'PHYSICAL_BOOK',
    totalQuantity: 10
  };
  
  const createBookRes = await api.post('/books', newBook);
  if (logResult('Create Book', createBookRes, 201)) {
    testBookId = createBookRes.data.result.id;
  }

  if (testBookId) {
    // Get Book By ID
    const getBookRes = await api.get(`/books/${testBookId}`);
    logResult('Get Book By ID', getBookRes);

    // Update Book
    const updateBookRes = await api.put(`/books/${testBookId}`, {
      title: `Updated ${newBook.title}`,
      author: 'Updated Author',
      bookType: 'PHYSICAL_BOOK',
      totalQuantity: 15
    });
    logResult('Update Book', updateBookRes);
  }

  // ==========================================
  // 4. PLAYLIST SERVICE
  // ==========================================
  console.log('\n--- Playlist Service ---');

  // Create Playlist
  const createPlaylistRes = await api.post('/library/playlists', {
    name: `Test Playlist ${Date.now()}`,
    description: 'Automated test playlist',
    // userId not needed in body for create, but sent in header
  }, {
    headers: { 'X-User-Id': bookUserNumericId } 
  });

  if (logResult('Create Playlist', createPlaylistRes, 201)) {
    testPlaylistId = createPlaylistRes.data.result ? createPlaylistRes.data.result.id : createPlaylistRes.data.id;
    // Playlist service returns DTO directly, not wrapped in ApiResponse?
    // Response check: { "id": 1, ... } -> Direct DTO?
    // BookController returns ApiResponse<BookDto>.
    // PlaylistController returns ResponseEntity<PlaylistDto>.
    // So createPlaylistRes.data is the PlaylistDto object.
    
    // ApiResponse format: { code: 1000, result: ... }
    // If Playlist returns direct DTO, check if it has id.
    if (!testPlaylistId && createPlaylistRes.data.id) {
       testPlaylistId = createPlaylistRes.data.id;
    }
  }

  if (testPlaylistId && testBookId) {
    // Add Book to Playlist
    const addToPlaylistRes = await api.post(`/library/playlists/${testPlaylistId}/books/${testBookId}`, {}, {
       headers: { 'X-User-Id': bookUserNumericId }
    });
    // AddBook might return 200 or 201? Controller says ok() -> 200.
    logResult('Add Book to Playlist', addToPlaylistRes);

    // Get Playlist Detail
    const getPlaylistRes = await api.get(`/library/playlists/${testPlaylistId}`, {
       headers: { 'X-User-Id': bookUserNumericId }
    });
    logResult('Get Playlist Detail', getPlaylistRes);
  }

  // ==========================================
  // 5. ORDER SERVICE
  // ==========================================
  console.log('\n--- Order Service ---');

  if (testBookId) {
    // Buy Book
    const buyOrderRes = await api.post('/orders/purchase', {
      userId: bookUserNumericId,
      bookId: testBookId,
      orderType: 'BUY' 
      // Controller sets this based on endpoint, but body might need it? 
      // Controller: dto.setOrderType(OrderType.BUY); so strictly not needed effectively
    });
    
    if (logResult('Create Buy Order', buyOrderRes, 201)) {
      testOrderId = buyOrderRes.data.result ? buyOrderRes.data.result.id : buyOrderRes.data.id;
    }

    // Get User Orders
    const getOrdersRes = await api.get(`/orders/by-user/${bookUserNumericId}`);
    logResult('Get User Orders', getOrdersRes);
    
    // Mark as Paid (if applicable) -- Wait, the service has this method
    if(testOrderId) {
        const payRes = await api.post(`/orders/${testOrderId}/paid`);
        logResult('Mark Order Paid', payRes);
    }
  }

  // ==========================================
  // CLEANUP
  // ==========================================
  console.log('\n--- Cleanup ---');

  if (testPlaylistId) {
    const delPlaylistRes = await api.delete(`/library/playlists/${testPlaylistId}`, {
       headers: { 'X-User-Id': bookUserNumericId }
    });
    logResult('Delete Playlist', delPlaylistRes);
  }

  if(testBookId) {
      const delBookRes = await api.delete(`/books/${testBookId}`);
      logResult('Delete Book', delBookRes);
  }

  console.log('\n✅ Tests Completed.');
}

runTests().catch(err => console.error('Fatal Error:', err));
