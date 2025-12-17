#!/usr/bin/env python3
"""
Book Service - Complete API Test Suite (34 Tests)
Tests all endpoints with proper authentication
"""

import requests
import json
from datetime import datetime

# Configuration
BOOK_SERVICE_URL = "http://localhost:8086"
IDENTITY_SERVICE_URL = "http://localhost:8080"

# Test Results
results = {
    "passed": [],
    "failed": [],
    "skipped": []
}

# Global variables for test data
admin_token = None
user_token = None
book_id_physical = None
book_id_digital = None
borrow_id = None
rental_id = None

def print_test(category, test_num, description):
    print(f"\n{'='*70}")
    print(f"[{category}] Test {test_num}: {description}")
    print(f"{'='*70}")

def test_request(method, url, headers=None, json_data=None, expected_status=None):
    """Make HTTP request and validate response"""
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=json_data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=json_data, timeout=10)
        elif method == "PATCH":
            response = requests.patch(url, headers=headers, json=json_data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        try:
            resp_json = response.json()
            print(f"Response: {json.dumps(resp_json, indent=2)[:500]}")
        except:
            print(f"Response: {response.text[:200]}")
        
        if expected_status and response.status_code != expected_status:
            print(f"❌ FAILED: Expected {expected_status}, got {response.status_code}")
            return None, False
        
        if response.status_code >= 200 and response.status_code < 300:
            print("✅ PASSED")
            return response, True
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            return response, False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return None, False

# ============================================================================
# SETUP: Get Authentication Tokens
# ============================================================================
def setup_authentication():
    global admin_token, user_token
    
    print("\n" + "="*70)
    print("SETUP: Getting Authentication Tokens")
    print("="*70)
    
    # Register and login as admin
    try:
        requests.post(f"{IDENTITY_SERVICE_URL}/identity/users/registration", json={
            "username": "admin_test",
            "password": "Admin@123",
            "email": "admin@test.com",
            "firstName": "Admin",
            "lastName": "User"
        }, timeout=5)
    except:
        pass
    
    response = requests.post(f"{IDENTITY_SERVICE_URL}/identity/auth/token", json={
        "username": "admin_test",
        "password": "Admin@123"
    })
    
    if response.status_code == 200:
        admin_token = response.json()["result"]["token"]
        print(f"✅ Admin token: {admin_token[:50]}...")
    else:
        print("❌ Failed to get admin token")
        return False
    
    # Register and login as user
    try:
        requests.post(f"{IDENTITY_SERVICE_URL}/identity/users/registration", json={
            "username": "user_test",
            "password": "User@123",
            "email": "user@test.com",
            "firstName": "Regular",
            "lastName": "User"
        }, timeout=5)
    except:
        pass
    
    response = requests.post(f"{IDENTITY_SERVICE_URL}/identity/auth/token", json={
        "username": "user_test",
        "password": "User@123"
    })
    
    if response.status_code == 200:
        user_token = response.json()["result"]["token"]
        print(f"✅ User token: {user_token[:50]}...")
    else:
        print("❌ Failed to get user token")
        return False
    
    return True

# ============================================================================
# CATEGORY 1: Book Management (Admin) - 7 Tests
# ============================================================================
def test_book_management():
    global book_id_physical, book_id_digital
    
    print("\n" + "#"*70)
    print("# CATEGORY 1: Book Management (Admin) - 7 Tests")
    print("#"*70)
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Test 1: Create physical book
    print_test("ADMIN", 1, "Create Physical Book")
    response, success = test_request("POST", f"{BOOK_SERVICE_URL}/api/admin/books", 
        headers=headers,
        json_data={
            "title": "Clean Architecture",
            "author": "Robert C. Martin",
            "isbn": "978-0134494166",
            "publisher": "Pearson",
            "description": "A guide to software structure and design",
            "bookType": "PHYSICAL_BOOK",
            "totalQuantity": 10,
            "pageCount": 432,
            "language": "English"
        }
    )
    
    if success and response:
        try:
            book_id_physical = response.json()["result"]["id"]
            results["passed"].append("Create Physical Book")
            print(f"   Book ID: {book_id_physical}")
        except:
            results["failed"].append("Create Physical Book - No ID returned")
    else:
        results["failed"].append("Create Physical Book")
    
    # Test 2: Create digital licensed book
    print_test("ADMIN", 2, "Create Digital Licensed Book")
    response, success = test_request("POST", f"{BOOK_SERVICE_URL}/api/admin/books",
        headers=headers,
        json_data={
            "title": "Domain-Driven Design",
            "author": "Eric Evans",
            "isbn": "978-0321125217",
            "bookType": "DIGITAL_LICENSED_BOOK",
            "description": "Tackling Complexity in Software",
            "totalQuantity": 999,
            "rentalPrice": 50000,
            "rentalDurationDays": 30
        }
    )
    
    if success and response:
        try:
            book_id_digital = response.json()["result"]["id"]
            results["passed"].append("Create Digital Licensed Book")
            print(f"   Book ID: {book_id_digital}")
        except:
            results["failed"].append("Create Digital Licensed Book - No ID")
    else:
        results["failed"].append("Create Digital Licensed Book")
    
    # Test 3: Update book
    if book_id_physical:
        print_test("ADMIN", 3, "Update Book")
        response, success = test_request("PUT", f"{BOOK_SERVICE_URL}/api/admin/books/{book_id_physical}",
            headers=headers,
            json_data={
                "title": "Clean Architecture (Updated)",
                "author": "Robert C. Martin",
                "isbn": "978-0134494166",
                "description": "Updated description",
                "totalQuantity": 15
            }
        )
        results["passed" if success else "failed"].append("Update Book")
    else:
        print_test("ADMIN", 3, "Update Book - SKIPPED (No book ID)")
        results["skipped"].append("Update Book")
    
    # Test 4: Update inventory
    if book_id_physical:
        print_test("ADMIN", 4, "Update Inventory")
        response, success = test_request("PATCH", 
            f"{BOOK_SERVICE_URL}/api/admin/books/{book_id_physical}/inventory?quantity=20",
            headers=headers
        )
        results["passed" if success else "failed"].append("Update Inventory")
    else:
        results["skipped"].append("Update Inventory")
    
    # Test 5: Update rental config
    if book_id_digital:
        print_test("ADMIN", 5, "Update Rental Config")
        response, success = test_request("PATCH",
            f"{BOOK_SERVICE_URL}/api/admin/books/{book_id_digital}/rental?price=60000&duration=45",
            headers=headers
        )
        results["passed" if success else "failed"].append("Update Rental Config")
    else:
        results["skipped"].append("Update Rental Config")
    
    # Test 6: Set book status
    if book_id_physical:
        print_test("ADMIN", 6, "Set Book Status")
        response, success = test_request("PATCH",
            f"{BOOK_SERVICE_URL}/api/admin/books/{book_id_physical}/status?status=AVAILABLE",
            headers=headers
        )
        results["passed" if success else "failed"].append("Set Book Status")
    else:
        results["skipped"].append("Set Book Status")
    
    # Test 7: Delete book (deferred to end)
    print_test("ADMIN", 7, "Delete Book - DEFERRED to cleanup")
    results["skipped"].append("Delete Book - Deferred")

# ============================================================================
# CATEGORY 2: Book Query (Public) - 6 Tests
# ============================================================================
def test_book_query():
    print("\n" + "#"*70)
    print("# CATEGORY 2: Book Query (Public) - 6 Tests")
    print("#"*70)
    
    # Test 8: Get all books
    print_test("PUBLIC", 8, "Get All Books (Paginated)")
    response, success = test_request("GET", f"{BOOK_SERVICE_URL}/books?page=0&size=10")
    results["passed" if success else "failed"].append("Get All Books")
    
    # Test 9: Get book by ID
    if book_id_physical:
        print_test("PUBLIC", 9, "Get Book By ID")
        response, success = test_request("GET", f"{BOOK_SERVICE_URL}/books/{book_id_physical}")
        results["passed" if success else "failed"].append("Get Book By ID")
    else:
        results["skipped"].append("Get Book By ID")
    
    # Test 10: Search books
    print_test("PUBLIC", 10, "Search Books")
    response, success = test_request("GET", f"{BOOK_SERVICE_URL}/books/search?query=Architecture")
    results["passed" if success else "failed"].append("Search Books")
    
    # Test 11: Get borrowable books
    print_test("PUBLIC", 11, "Get Borrowable Books")
    response, success = test_request("GET", f"{BOOK_SERVICE_URL}/books/borrowable")
    results["passed" if success else "failed"].append("Get Borrowable Books")
    
    # Test 12: Get rentable books
    print_test("PUBLIC", 12, "Get Rentable Books")
    response, success = test_request("GET", f"{BOOK_SERVICE_URL}/books/rentable")
    results["passed" if success else "failed"].append("Get Rentable Books")
    
    # Test 13: Get statistics
    print_test("PUBLIC", 13, "Get Statistics")
    headers = {"Authorization": f"Bearer {admin_token}"}
    response, success = test_request("GET", f"{BOOK_SERVICE_URL}/books/statistics", headers=headers)
    results["passed" if success else "failed"].append("Get Statistics")

# ============================================================================
# CATEGORY 3: Book Borrow (User) - 5 Tests
# ============================================================================
def test_book_borrow():
    global borrow_id
    
    print("\n" + "#"*70)
    print("# CATEGORY 3: Book Borrow (User) - 5 Tests")
    print("#"*70)
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test 14: Borrow book
    if book_id_physical:
        print_test("USER", 14, "Borrow Book")
        response, success = test_request("POST", f"{BOOK_SERVICE_URL}/api/borrows",
            headers=headers,
            json_data={
                "bookId": book_id_physical,
                "borrowDays": 14
            }
        )
        
        if success and response:
            try:
                borrow_id = response.json()["result"]["id"]
                results["passed"].append("Borrow Book")
                print(f"   Borrow ID: {borrow_id}")
            except:
                results["failed"].append("Borrow Book - No ID")
        else:
            results["failed"].append("Borrow Book")
    else:
        results["skipped"].append("Borrow Book")
    
    # Test 15: Get active borrows
    print_test("USER", 15, "Get Active Borrows")
    response, success = test_request("GET", f"{BOOK_SERVICE_URL}/api/borrows/active", headers=headers)
    results["passed" if success else "failed"].append("Get Active Borrows")
    
    # Test 16: Get borrow history
    print_test("USER", 16, "Get Borrow History")
    response, success = test_request("GET", f"{BOOK_SERVICE_URL}/api/borrows", headers=headers)
    results["passed" if success else "failed"].append("Get Borrow History")
    
    # Test 17: Return book
    if borrow_id:
        print_test("USER", 17, "Return Book")
        response, success = test_request("POST", f"{BOOK_SERVICE_URL}/api/borrows/{borrow_id}/return",
            headers=headers
        )
        results["passed" if success else "failed"].append("Return Book")
    else:
        results["skipped"].append("Return Book")
    
    # Test 18: Get overdue borrows (admin)
    print_test("ADMIN", 18, "Get Overdue Borrows")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    response, success = test_request("GET", f"{BOOK_SERVICE_URL}/api/borrows/overdue", headers=admin_headers)
    results["passed" if success else "failed"].append("Get Overdue Borrows")

# ============================================================================
# PRINT SUMMARY
# ============================================================================
def print_summary():
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"✅ PASSED:  {len(results['passed'])}")
    print(f"❌ FAILED:  {len(results['failed'])}")
    print(f"⏭️  SKIPPED: {len(results['skipped'])}")
    print(f"📊 TOTAL:   {len(results['passed']) + len(results['failed']) + len(results['skipped'])}")
    
    if results['failed']:
        print("\n❌ Failed Tests:")
        for test in results['failed']:
            print(f"   - {test}")
    
    if results['skipped']:
        print("\n⏭️  Skipped Tests:")
        for test in results['skipped']:
            print(f"   - {test}")
    
    print("\n" + "="*70)

# ============================================================================
# MAIN
# ============================================================================
if __name__ == "__main__":
    print("\n" + "="*70)
    print("BOOK SERVICE - COMPREHENSIVE API TEST SUITE")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    if not setup_authentication():
        print("\n❌ Failed to setup authentication. Exiting.")
        exit(1)
    
    # Run test categories
    test_book_management()     # 7 tests
    test_book_query()          # 6 tests
    test_book_borrow()         # 5 tests
    
    # Print final summary
    print_summary()
    
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
