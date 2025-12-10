import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/apiClient';
import { useMemo, useState } from 'react';
import { 
  Search, 
  Edit2, 
  X, 
  Save, 
  BookOpen, 
  Calendar, 
  User, 
  Building2, 
  Hash,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog } from '@headlessui/react';
import { clsx } from 'clsx';

// Schema for book validation
const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().optional(),
  publisher: z.string().optional(),
  publishedAt: z.string().optional(),
  isbn: z.string().min(10, "ISBN must be at least 10 characters").optional().or(z.literal('')),
  pageCount: z.coerce.number().min(0).optional(),
  language: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function TotalBooks() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Fetch books
  const { data: books, isLoading, error } = useQuery({ 
    queryKey: ['books'], 
    queryFn: async () => (await api.get('/book/books')).data 
  });

  // Filter books
  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter((b: any) => 
      !search || 
      (b.title?.toLowerCase().includes(search.toLowerCase()) || 
       b.author?.toLowerCase().includes(search.toLowerCase()) ||
       b.isbn?.includes(search))
    );
  }, [books, search]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: BookFormData }) => {
      // Ensure date is formatted correctly if needed, usually backend accepts ISO string or YYYY-MM-DD
      return api.put(`/book/books/${id}`, payload);
    },
    onSuccess: () => {
      console.info(`[Audit] User edited book ${editingBook.id} at ${new Date().toISOString()}`);
      qc.invalidateQueries({ queryKey: ['books'] });
      setNotification({ type: 'success', message: 'Book updated successfully' });
      setIsModalOpen(false);
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({ type: 'error', message: err.message || 'Failed to update book' });
    }
  });

  const handleEdit = (book: any) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Management</h1>
          <p className="text-gray-500 mt-1">Manage and organize your library collection</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by title, author, ISBN..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-80 transition-all" 
          />
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={clsx(
          "mb-6 p-4 rounded-lg flex items-center gap-3",
          notification.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        )}>
          {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {notification.message}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg">
          Failed to load books. Please try again later.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Book Details</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Author</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">ISBN</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Publisher</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No books found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book: any) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden border border-gray-200">
                            {book.thumbnailUrl ? (
                              <img src={book.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <BookOpen className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-1" title={book.title}>{book.title}</div>
                            <div className="text-gray-500 text-xs mt-1">{book.pageCount ? `${book.pageCount} pages` : 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{book.author}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{book.isbn || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div>{book.publisher || '—'}</div>
                        <div className="text-xs text-gray-400">{book.publishedAt || book.publishDate || ''}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEdit(book)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Book Details</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <BookForm 
                book={editingBook} 
                onSubmit={(data) => updateMutation.mutate({ id: editingBook.id, payload: data })}
                isSubmitting={updateMutation.isPending}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookForm({ book, onSubmit, isSubmitting, onCancel }: { 
  book: any, 
  onSubmit: (data: BookFormData) => void, 
  isSubmitting: boolean,
  onCancel: () => void 
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    values: {
      title: book?.title || '',
      author: book?.author || '',
      description: book?.description || '',
      publisher: book?.publisher || '',
      publishedAt: (book?.publishedAt || book?.publishDate || '').split('T')[0],
      isbn: book?.isbn || '',
      pageCount: Number(book?.pageCount) || 0,
      language: book?.language || 'en',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              {...register('title')} 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Book title"
            />
          </div>
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Author</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              {...register('author')} 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Author name"
            />
          </div>
          {errors.author && <p className="text-sm text-red-500">{errors.author.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Publisher</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              {...register('publisher')} 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Publisher"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Publication Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="date"
              {...register('publishedAt')} 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">ISBN</label>
          <div className="relative">
            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              {...register('isbn')} 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="ISBN-13"
            />
          </div>
          {errors.isbn && <p className="text-sm text-red-500">{errors.isbn.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Page Count</label>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="number"
              {...register('pageCount')} 
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea 
          {...register('description')} 
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          placeholder="Book description..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
