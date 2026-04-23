# 📚 Library Management System — Complete Setup Guide

## Prerequisites (Install These First)
- Node.js v18+ → https://nodejs.org
- PostgreSQL v14+ → https://www.postgresql.org/download/
- Git (optional)

---

## STEP 1: Set Up PostgreSQL Database

### 1.1 Open PostgreSQL (psql terminal)
```bash
# On Windows: Open "SQL Shell (psql)" from Start Menu
# On Mac/Linux:
psql -U postgres
```

### 1.2 Create the database
```sql
CREATE DATABASE library_db;
\c library_db
```

### 1.3 Run the schema file
```sql
-- In psql, run:
\i /full/path/to/library-management-system/database/schema.sql

-- OR copy-paste the entire schema.sql content into psql
```

### 1.4 Verify tables were created
```sql
\dt
-- Should show: users, books, transactions, reservations
```

---

## STEP 2: Configure Backend

### 2.1 Go to backend folder
```bash
cd library-management-system/backend
```

### 2.2 Create your .env file
```bash
cp .env.example .env
```

### 2.3 Edit .env with your database password
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_db
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD   ← Change this!
JWT_SECRET=any_long_random_string_here
FINE_PER_DAY=2
PORT=5000
```

### 2.4 Install dependencies
```bash
npm install
```

### 2.5 Start the backend server
```bash
npm run dev
```
✅ You should see:
```
🚀 Server running on http://localhost:5000
✅ PostgreSQL connected successfully
📚 Library Management System API ready
```

---

## STEP 3: Set Up Frontend

### 3.1 Open a NEW terminal tab/window

### 3.2 Go to frontend folder
```bash
cd library-management-system/frontend
```

### 3.3 Install dependencies
```bash
npm install
```

### 3.4 Start the React app
```bash
npm start
```
✅ Browser opens at: http://localhost:3000

---

## STEP 4: Test the Application

### Default Login Credentials
| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Admin   | admin@library.com   | admin123  |
| Student | alice@student.com   | admin123  |
| Student | bob@student.com     | admin123  |

### Test as Admin:
1. Login with admin@library.com / admin123
2. See dashboard with stats
3. Go to Books → Add a new book
4. Issue a book to a student
5. Go to Transactions → Return a book

### Test as Student:
1. Login with alice@student.com / admin123
2. Go to Browse Books → Issue a book
3. Try reserving an out-of-stock book
4. Go to My Books → Return a book

---

## STEP 5: API Endpoints Reference

### Auth
| Method | Endpoint              | Access  | Description        |
|--------|-----------------------|---------|--------------------|
| POST   | /api/auth/register    | Public  | Register student   |
| POST   | /api/auth/login       | Public  | Login              |
| GET    | /api/auth/me          | Any     | Get own profile    |
| GET    | /api/auth/students    | Admin   | List all students  |

### Books
| Method | Endpoint              | Access  | Description        |
|--------|-----------------------|---------|--------------------|
| GET    | /api/books            | Any     | List/search books  |
| GET    | /api/books/:id        | Any     | Get single book    |
| POST   | /api/books            | Admin   | Add book           |
| PUT    | /api/books/:id        | Admin   | Update book        |
| DELETE | /api/books/:id        | Admin   | Delete book        |
| GET    | /api/books/stats      | Admin   | Book statistics    |
| GET    | /api/books/genres     | Any     | List genres        |

### Transactions
| Method | Endpoint                  | Access  | Description          |
|--------|---------------------------|---------|----------------------|
| POST   | /api/transactions/issue   | Any     | Issue a book         |
| POST   | /api/transactions/return  | Any     | Return a book        |
| GET    | /api/transactions         | Admin   | All transactions     |
| GET    | /api/transactions/my      | Student | My transactions      |
| GET    | /api/transactions/overdue | Admin   | Overdue books        |
| GET    | /api/transactions/stats   | Admin   | Transaction stats    |

### Reservations
| Method | Endpoint                        | Access  | Description         |
|--------|---------------------------------|---------|---------------------|
| POST   | /api/reservations               | Student | Reserve a book      |
| PUT    | /api/reservations/:id/cancel    | Student | Cancel reservation  |
| GET    | /api/reservations               | Admin   | All reservations    |
| GET    | /api/reservations/my            | Student | My reservations     |

---

## STEP 6: Project Structure Explained

```
backend/
  config/db.js           → PostgreSQL connection pool
  models/                → SQL query functions (one per table)
  controllers/           → Business logic for each feature
  routes/                → URL-to-controller mapping
  middleware/            → JWT auth check, error handling
  server.js              → Express app entry point

frontend/
  src/
    api/axios.js         → Axios with auto JWT header
    context/AuthContext  → Global login state
    components/          → Navbar, ProtectedRoute
    pages/               → Each screen/page
    App.jsx              → Routes setup
    App.css              → All styling
```

---

## Common Errors & Fixes

### ❌ "password authentication failed for user postgres"
→ Check DB_PASSWORD in your .env file

### ❌ "relation 'users' does not exist"
→ Run schema.sql again in the correct database (library_db)

### ❌ "ECONNREFUSED 127.0.0.1:5000"
→ Backend server is not running. Run: npm run dev in backend/

### ❌ "Cannot find module 'bcryptjs'"
→ Run: npm install in the backend/ folder

### ❌ React shows blank page
→ Check browser console (F12). Usually an API error. Confirm backend is running.

---

## Business Rules Implemented
- ✅ Students can issue max 3 books at a time
- ✅ Cannot issue same book twice without returning
- ✅ Cannot issue if 0 copies available (reserve instead)
- ✅ Fine = ₹2 per overdue day (configurable via .env)
- ✅ Reservations expire in 7 days
- ✅ Admins can issue to any student; students issue for themselves
- ✅ Role-based access: admins can't access student pages and vice versa
- ✅ JWT tokens expire in 7 days (configurable)
```
