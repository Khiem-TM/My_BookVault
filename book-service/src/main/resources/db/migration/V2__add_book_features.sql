-- Migration V2: Add Clean Architecture Features to Book Service
-- Description: Adds new columns for BookType, BookStatus, inventory management, and rental features
-- Author: Book Service Refactoring Team
-- Date: 2025-12-16

-- ============================================================================
-- 1. Add new columns to books table
-- ============================================================================

-- Add book type and status columns
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS book_type VARCHAR(50) DEFAULT 'PHYSICAL_BOOK' COMMENT 'Type of book: PHYSICAL_BOOK, DIGITAL_FREE_BOOK, DIGITAL_LICENSED_BOOK',
ADD COLUMN IF NOT EXISTS book_status VARCHAR(50) DEFAULT 'AVAILABLE' COMMENT 'Status: AVAILABLE, BORROWED, OUT_OF_STOCK, DISABLED';

-- Add inventory management columns
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS total_quantity INT DEFAULT 0 COMMENT 'Total number of copies (for physical books)',
ADD COLUMN IF NOT EXISTS available_quantity INT DEFAULT 0 COMMENT 'Number of available copies';

-- Add rental configuration columns
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS rental_price DECIMAL(10,2) DEFAULT NULL COMMENT 'Rental price for digital licensed books',
ADD COLUMN IF NOT EXISTS rental_duration_days INT DEFAULT NULL COMMENT 'Default rental duration in days';

-- Add audit columns
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255) DEFAULT NULL COMMENT 'User who created the record',
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255) DEFAULT NULL COMMENT 'User who last updated the record';

-- ============================================================================
-- 2. Update transactions table
-- ============================================================================

-- Ensure status column can hold new enum values
ALTER TABLE transactions 
MODIFY COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' COMMENT 'Status: ACTIVE, OVERDUE, RETURNED, RETURNED_OVERDUE';

-- ============================================================================
-- 3. Add rental tracking columns to orders table
-- ============================================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS rental_start_date TIMESTAMP DEFAULT NULL COMMENT 'When rental period started',
ADD COLUMN IF NOT EXISTS rental_expiry_date TIMESTAMP DEFAULT NULL COMMENT 'When rental period expires',
ADD COLUMN IF NOT EXISTS rental_price DECIMAL(10,2) DEFAULT NULL COMMENT 'Price paid for this rental';

-- ============================================================================
-- 4. Create indexes for performance
-- ============================================================================

-- Books table indexes
CREATE INDEX IF NOT EXISTS idx_book_type_status ON books(book_type, book_status);
CREATE INDEX IF NOT EXISTS idx_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_book_status ON books(book_status);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transaction_user_status ON transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transaction_due_date ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transaction_book_id ON transactions(book_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_order_user_type ON orders(user_id, order_type);
CREATE INDEX IF NOT EXISTS idx_order_expiry ON orders(rental_expiry_date);

-- ============================================================================
-- 5. Migrate existing data
-- ============================================================================

-- Set default book type for existing books
UPDATE books 
SET book_type = 'PHYSICAL_BOOK' 
WHERE book_type IS NULL OR book_type = '';

-- Set default book status for existing books
UPDATE books 
SET book_status = 'AVAILABLE' 
WHERE book_status IS NULL OR book_status = '';

-- Set default status for existing transactions
UPDATE transactions 
SET status = 'ACTIVE' 
WHERE status IS NULL OR status = '';

-- Mark returned transactions
UPDATE transactions 
SET status = 'RETURNED' 
WHERE return_date IS NOT NULL AND status = 'ACTIVE';

-- Mark overdue transactions (14 days default)
UPDATE transactions 
SET status = 'OVERDUE' 
WHERE return_date IS NULL 
  AND due_date < NOW() 
  AND status = 'ACTIVE';

-- Initialize inventory for existing physical books (assume 1 copy if borrowed)
UPDATE books b
SET 
  total_quantity = COALESCE((
    SELECT COUNT(*) 
    FROM transactions t 
    WHERE t.book_id = b.id AND t.return_date IS NULL
  ), 0) + 1,
  available_quantity = 1
WHERE book_type = 'PHYSICAL_BOOK' 
  AND total_quantity = 0;

-- ============================================================================
-- 6. Add constraints
-- ============================================================================

-- Ensure valid book types
ALTER TABLE books 
ADD CONSTRAINT chk_book_type 
CHECK (book_type IN ('PHYSICAL_BOOK', 'DIGITAL_FREE_BOOK', 'DIGITAL_LICENSED_BOOK'));

-- Ensure valid book status
ALTER TABLE books 
ADD CONSTRAINT chk_book_status 
CHECK (book_status IN ('AVAILABLE', 'BORROWED', 'OUT_OF_STOCK', 'DISABLED'));

-- Ensure valid transaction status
ALTER TABLE transactions 
ADD CONSTRAINT chk_transaction_status 
CHECK (status IN ('ACTIVE', 'OVERDUE', 'RETURNED', 'RETURNED_OVERDUE'));

-- Ensure rental price is positive
ALTER TABLE books 
ADD CONSTRAINT chk_rental_price 
CHECK (rental_price IS NULL OR rental_price >= 0);

-- Ensure quantities are non-negative
ALTER TABLE books 
ADD CONSTRAINT chk_quantities 
CHECK (total_quantity >= 0 AND available_quantity >= 0 AND available_quantity <= total_quantity);

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- This migration adds all necessary columns and indexes for the Clean Architecture refactoring
-- Run this on dev/staging environments first before production
