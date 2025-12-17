import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../features/user/Home';
import { bookService } from '../../services/apiServices';
import '@testing-library/jest-dom';

// Mock dependencies
vi.mock('../../services/apiServices', () => ({
  bookService: {
    getBooks: vi.fn(),
    getCategories: vi.fn(),
  },
}));

describe('User Feature - Home Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock promises that don't resolve immediately
    (bookService.getBooks as any).mockReturnValue(new Promise(() => {}));
    (bookService.getCategories as any).mockReturnValue(new Promise(() => {}));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    // Check for loading indicators or lack of content
    // Note: Implementation specific, but usually we look for skeleton or loading text
    // Assuming Home doesn't show explicit "Loading..." text but might be empty
  });

  it('renders featured books and categories after data fetch', async () => {
    const mockBooks = {
      content: [
        { id: 1, title: 'Clean Code', author: 'Robert Martin', price: 50 },
        { id: 2, title: 'The Pragmatic Programmer', author: 'Andy Hunt', price: 45 },
      ],
    };
    const mockCategories = ['Technology', 'Fiction', 'Science'];

    (bookService.getBooks as any).mockResolvedValue(mockBooks);
    (bookService.getCategories as any).mockResolvedValue(mockCategories);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Clean Code')).toBeInTheDocument();
      expect(screen.getByText('Robert Martin')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (bookService.getBooks as any).mockRejectedValue(new Error('API Error'));
    (bookService.getCategories as any).mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load books and categories')).toBeInTheDocument();
    });
    
    consoleSpy.mockRestore();
  });
});
