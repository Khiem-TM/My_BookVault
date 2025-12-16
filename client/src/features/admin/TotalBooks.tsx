import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  Edit2,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import adminBookService, { BookDto } from "../../services/adminBookService";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().optional().default(""),
  publisher: z.string().optional().default(""),
  publishedAt: z.string().optional().default(""),
  isbn: z.string().optional().default(""),
  pageCount: z.coerce.number().int().min(0).optional(),
  language: z.string().optional().default("en"),
  category: z.string().optional().default(""),
  coverUrl: z.string().optional().default(""),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function TotalBooks() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [editingBook, setEditingBook] = useState<BookDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    data: booksData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-books", currentPage, pageSize, search],
    queryFn: async () =>
      await adminBookService.getAllBooks(
        currentPage,
        pageSize,
        search || undefined
      ),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      if (!editingBook?.id) throw new Error("No book selected");
      return adminBookService.updateBook(editingBook.id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-books"] });
      setNotification({
        type: "success",
        message: "Book updated successfully",
      });
      setIsModalOpen(false);
      setEditingBook(null);
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({
        type: "error",
        message: err.message || "Failed to update book",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      return adminBookService.createBook(data as BookDto);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-books"] });
      setNotification({
        type: "success",
        message: "Book created successfully",
      });
      setIsModalOpen(false);
      setIsCreating(false);
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({
        type: "error",
        message: err.message || "Failed to create book",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return adminBookService.deleteBook(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-books"] });
      setNotification({
        type: "success",
        message: "Book deleted successfully",
      });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setNotification({
        type: "error",
        message: err.message || "Failed to delete book",
      });
    },
  });

  const handleEdit = (book: BookDto) => {
    setEditingBook(book);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBook(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBook(null);
    setIsCreating(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* Notifications */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Books Management</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          Add Book
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Books Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Failed to load books. Please try again.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Publisher
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {booksData?.content && booksData.content.length > 0 ? (
                booksData.content.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {book.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {book.category || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {book.publisher || "-"}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete "${book.title}"?`
                            )
                          ) {
                            deleteMutation.mutate(book.id!);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {booksData && booksData.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage + 1} of {booksData.totalPages} (
            {booksData.totalElements} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(booksData.totalPages - 1, currentPage + 1)
                )
              }
              disabled={currentPage === booksData.totalPages - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                {isCreating ? "Create New Book" : "Edit Book"}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <BookForm
                book={editingBook || undefined}
                onSubmit={(data) => {
                  if (isCreating) {
                    createMutation.mutate(data);
                  } else {
                    updateMutation.mutate(data);
                  }
                }}
                isSubmitting={
                  updateMutation.isPending || createMutation.isPending
                }
                onCancel={handleModalClose}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BookForm({
  book,
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  book?: BookDto;
  onSubmit: (data: BookFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: book
      ? {
          title: book.title,
          author: book.author,
          description: book.description || "",
          publisher: book.publisher || "",
          publishedAt: book.publishedAt
            ? new Date(book.publishedAt).toISOString().split("T")[0]
            : "",
          isbn: book.isbn || "",
          pageCount: book.pageCount || 0,
          language: book.language || "en",
          category: book.category || "",
          coverUrl: book.coverUrl || "",
        }
      : {
          title: "",
          author: "",
          description: "",
          publisher: "",
          publishedAt: "",
          isbn: "",
          pageCount: 0,
          language: "en",
          category: "",
          coverUrl: "",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Title *
          </label>
          <input
            {...register("title")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Book title"
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">
              {String(errors.title?.message)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Author *
          </label>
          <input
            {...register("author")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Author name"
          />
          {errors.author && (
            <p className="text-sm text-red-500 mt-1">
              {String(errors.author?.message)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Publisher
          </label>
          <input
            {...register("publisher")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Publisher name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Publication Date
          </label>
          <input
            type="date"
            {...register("publishedAt")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            ISBN
          </label>
          <input
            {...register("isbn")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ISBN number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Page Count
          </label>
          <input
            type="number"
            {...register("pageCount")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Language
          </label>
          <select
            {...register("language")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="vi">Vietnamese</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Category
          </label>
          <input
            {...register("category")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Book category"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Description
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Book description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Cover URL
        </label>
        <input
          {...register("coverUrl")}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/cover.jpg"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </button>
      </div>
    </form>
  );
}
