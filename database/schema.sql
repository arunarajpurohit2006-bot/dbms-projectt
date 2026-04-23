-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM - PostgreSQL Schema
-- Normalized to 3NF
-- ============================================================

-- Drop tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- TABLE 1: users
-- Stores both Admin and Student accounts
-- ============================================================
CREATE TABLE users (
    user_id     SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,           -- stores hashed password
    role        VARCHAR(10) NOT NULL DEFAULT 'student'
                    CHECK (role IN ('admin', 'student')),
    phone       VARCHAR(15),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: books
-- Stores book catalog with copy tracking
-- ============================================================
CREATE TABLE books (
    book_id         SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    author          VARCHAR(150) NOT NULL,
    isbn            VARCHAR(20) UNIQUE NOT NULL,
    genre           VARCHAR(100),
    publisher       VARCHAR(150),
    publish_year    INTEGER CHECK (publish_year > 1000 AND publish_year <= EXTRACT(YEAR FROM NOW())),
    total_copies    INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    shelf_location  VARCHAR(50),
    added_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure available copies never exceed total copies
    CONSTRAINT check_copies CHECK (available_copies <= total_copies)
);

-- ============================================================
-- TABLE 3: transactions
-- Records every book issue and return
-- ============================================================
CREATE TABLE transactions (
    transaction_id  SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id         INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'), -- 2-week lending period
    return_date     DATE,                         -- NULL means book is still issued
    status          VARCHAR(10) NOT NULL DEFAULT 'issued'
                        CHECK (status IN ('issued', 'returned', 'overdue')),
    fine_amount     NUMERIC(8,2) DEFAULT 0.00,    -- calculated on return
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 4: reservations
-- Allows students to reserve unavailable books
-- ============================================================
CREATE TABLE reservations (
    reservation_id  SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    book_id         INTEGER NOT NULL REFERENCES books(book_id) ON DELETE CASCADE,
    reserved_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'), -- reservation valid 7 days
    status          VARCHAR(10) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
    -- Prevent duplicate active reservations for same user+book
    CONSTRAINT unique_active_reservation UNIQUE (user_id, book_id, status)
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_transactions_user    ON transactions(user_id);
CREATE INDEX idx_transactions_book    ON transactions(book_id);
CREATE INDEX idx_transactions_status  ON transactions(status);
CREATE INDEX idx_reservations_user    ON reservations(user_id);
CREATE INDEX idx_reservations_book    ON reservations(book_id);
CREATE INDEX idx_books_isbn           ON books(isbn);

-- ============================================================
-- SEED DATA - Sample records for testing
-- ============================================================

-- Default admin user (password: admin123 - bcrypt hashed)
INSERT INTO users (name, email, password, role, phone) VALUES
('Admin User',    'admin@library.com',   '$2b$10$rQnG7yV8ZJvKmN1pXkL3/.qY2hF5gD8sW6aE4cB9mT0uI7oP3xR1e', 'admin',   '9999999999'),
('Alice Student', 'alice@student.com',   '$2b$10$rQnG7yV8ZJvKmN1pXkL3/.qY2hF5gD8sW6aE4cB9mT0uI7oP3xR1e', 'student', '8888888888'),
('Bob Student',   'bob@student.com',     '$2b$10$rQnG7yV8ZJvKmN1pXkL3/.qY2hF5gD8sW6aE4cB9mT0uI7oP3xR1e', 'student', '7777777777');

-- Sample books
INSERT INTO books (title, author, isbn, genre, publisher, publish_year, total_copies, available_copies, shelf_location) VALUES
('The Great Gatsby',          'F. Scott Fitzgerald', '978-0743273565', 'Fiction',          'Scribner',           1925, 3, 3, 'A-01'),
('To Kill a Mockingbird',     'Harper Lee',          '978-0061935466', 'Fiction',          'HarperCollins',      1960, 2, 2, 'A-02'),
('Introduction to Algorithms','Thomas H. Cormen',    '978-0262033848', 'Computer Science', 'MIT Press',          2009, 5, 5, 'C-01'),
('Database System Concepts',  'Abraham Silberschatz','978-0073523323', 'Computer Science', 'McGraw-Hill',        2019, 4, 4, 'C-02'),
('Clean Code',                'Robert C. Martin',    '978-0132350884', 'Computer Science', 'Prentice Hall',      2008, 3, 3, 'C-03'),
('1984',                      'George Orwell',       '978-0451524935', 'Dystopian',        'Signet Classic',     1949, 2, 2, 'A-03'),
('The Alchemist',             'Paulo Coelho',        '978-0062315007', 'Fiction',          'HarperOne',          1988, 3, 3, 'A-04'),
('Sapiens',                   'Yuval Noah Harari',   '978-0062316097', 'Non-Fiction',      'Harper Perennial',   2011, 2, 2, 'B-01');

-- ============================================================
-- USEFUL VIEWS (optional but helpful)
-- ============================================================

-- View: Currently issued books with user and book details
CREATE OR REPLACE VIEW active_issues AS
SELECT
    t.transaction_id,
    u.name AS student_name,
    u.email AS student_email,
    b.title AS book_title,
    b.author,
    t.issue_date,
    t.due_date,
    CASE
        WHEN t.due_date < CURRENT_DATE THEN 'OVERDUE'
        ELSE 'ON TIME'
    END AS return_status,
    (CURRENT_DATE - t.due_date) AS days_overdue
FROM transactions t
JOIN users  u ON t.user_id = u.user_id
JOIN books  b ON t.book_id = b.book_id
WHERE t.status = 'issued';

-- View: Book availability summary
CREATE OR REPLACE VIEW book_availability AS
SELECT
    book_id,
    title,
    author,
    isbn,
    genre,
    total_copies,
    available_copies,
    (total_copies - available_copies) AS issued_copies,
    CASE
        WHEN available_copies > 0 THEN 'Available'
        ELSE 'Not Available'
    END AS availability_status
FROM books;
