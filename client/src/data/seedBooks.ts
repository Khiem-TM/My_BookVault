// Seed data for books
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  isbn: string;
  quantity: number;
  publishDate: string;
  publisher: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  tags: string[];
}

export const seedBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description:
      "A classic American novel set in the Jazz Age that explores themes of wealth, love, idealism, and moral decay.",
    category: "Classic Literature",
    price: 12.99,
    isbn: "978-0-7432-7356-5",
    quantity: 25,
    publishDate: "1925-04-10",
    publisher: "Scribner",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.2,
    reviews: 1847,
    tags: ["Classic", "American Literature", "Jazz Age", "Romance"],
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description:
      "A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.",
    category: "Classic Literature",
    price: 14.99,
    isbn: "978-0-06-112008-4",
    quantity: 30,
    publishDate: "1960-07-11",
    publisher: "J.B. Lippincott & Co.",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.5,
    reviews: 2156,
    tags: ["Classic", "Social Justice", "Coming of Age", "Drama"],
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    description:
      "A dystopian social science fiction novel that examines the dangers of totalitarianism and extreme political ideology.",
    category: "Science Fiction",
    price: 13.99,
    isbn: "978-0-452-28423-4",
    quantity: 40,
    publishDate: "1949-06-08",
    publisher: "Secker & Warburg",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.7,
    reviews: 3241,
    tags: ["Dystopian", "Political", "Science Fiction", "Philosophy"],
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description:
      "A romantic novel that charts the emotional development of protagonist Elizabeth Bennet.",
    category: "Romance",
    price: 11.99,
    isbn: "978-0-14-143951-8",
    quantity: 35,
    publishDate: "1813-01-28",
    publisher: "T. Egerton",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.4,
    reviews: 1923,
    tags: ["Romance", "Classic", "British Literature", "Comedy"],
  },
  {
    id: "5",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description:
      "A coming-of-age story that has become one of the most translated, published, and read books in the world.",
    category: "Coming of Age",
    price: 15.99,
    isbn: "978-0-316-76948-0",
    quantity: 20,
    publishDate: "1951-07-16",
    publisher: "Little, Brown and Company",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.0,
    reviews: 1654,
    tags: ["Coming of Age", "Classic", "Psychological", "Drama"],
  },
  {
    id: "6",
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description:
      "The first novel in the Harry Potter series, following a young wizard's journey at Hogwarts School.",
    category: "Fantasy",
    price: 16.99,
    isbn: "978-0-7475-3269-9",
    quantity: 50,
    publishDate: "1997-06-26",
    publisher: "Bloomsbury",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.8,
    reviews: 4521,
    tags: ["Fantasy", "Magic", "Adventure", "Young Adult"],
  },
  {
    id: "7",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    description:
      "An epic high fantasy novel that follows the quest to destroy the One Ring and defeat the Dark Lord Sauron.",
    category: "Fantasy",
    price: 25.99,
    isbn: "978-0-618-00222-1",
    quantity: 15,
    publishDate: "1954-07-29",
    publisher: "Allen & Unwin",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.9,
    reviews: 5847,
    tags: ["Fantasy", "Epic", "Adventure", "Classic"],
  },
  {
    id: "8",
    title: "Dune",
    author: "Frank Herbert",
    description:
      "A science fiction epic set in the distant future amidst a feudal interstellar society.",
    category: "Science Fiction",
    price: 18.99,
    isbn: "978-0-441-17271-9",
    quantity: 25,
    publishDate: "1965-08-01",
    publisher: "Chilton Books",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.6,
    reviews: 2847,
    tags: ["Science Fiction", "Space Opera", "Politics", "Ecology"],
  },
  {
    id: "9",
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    description:
      "A comedy science fiction series that follows the misadventures of Arthur Dent.",
    category: "Science Fiction",
    price: 14.99,
    isbn: "978-0-345-39180-3",
    quantity: 30,
    publishDate: "1979-10-12",
    publisher: "Pan Books",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.3,
    reviews: 1956,
    tags: ["Science Fiction", "Comedy", "Adventure", "Satire"],
  },
  {
    id: "10",
    title: "Brave New World",
    author: "Aldous Huxley",
    description:
      "A dystopian novel that explores themes of technology, society, and human nature.",
    category: "Science Fiction",
    price: 13.99,
    isbn: "978-0-06-085052-4",
    quantity: 35,
    publishDate: "1932-01-01",
    publisher: "Chatto & Windus",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.1,
    reviews: 2134,
    tags: ["Dystopian", "Philosophy", "Science Fiction", "Social Commentary"],
  },
  {
    id: "11",
    title: "The Alchemist",
    author: "Paulo Coelho",
    description:
      "A philosophical novel about a young shepherd's journey to find treasure and discover his personal legend.",
    category: "Philosophy",
    price: 12.99,
    isbn: "978-0-06-112241-5",
    quantity: 40,
    publishDate: "1988-01-01",
    publisher: "HarperCollins",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.2,
    reviews: 3456,
    tags: ["Philosophy", "Spiritual", "Adventure", "Self-help"],
  },
  {
    id: "12",
    title: "One Hundred Years of Solitude",
    author: "Gabriel García Márquez",
    description:
      "A landmark novel that tells the multi-generational story of the Buendía family.",
    category: "Magical Realism",
    price: 16.99,
    isbn: "978-0-06-088328-8",
    quantity: 20,
    publishDate: "1967-05-30",
    publisher: "Sudamericana",
    imageUrl: "/api/placeholder/300/400",
    rating: 4.4,
    reviews: 1789,
    tags: ["Magical Realism", "Latin American", "Family Saga", "Classic"],
  },
];

export const categories = [
  "All Categories",
  "Classic Literature",
  "Science Fiction",
  "Romance",
  "Fantasy",
  "Coming of Age",
  "Philosophy",
  "Magical Realism",
];

export const popularTags = [
  "Classic",
  "Romance",
  "Adventure",
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Drama",
  "Comedy",
  "Philosophy",
  "Young Adult",
];
