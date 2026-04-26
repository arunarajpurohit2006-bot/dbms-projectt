// ============================================================
// routes/bookRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  getGenres,
  getStats,
} = require("../controllers/bookController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, getBooks); // All logged-in users can view books
router.get("/genres", protect, getGenres); // Get genre list for filter
router.get("/stats", protect, adminOnly, getStats); // Admin only
router.get("/:id", protect, getBook); // Single book
router.post("/", protect, adminOnly, addBook); // Admin
router.put("/:id", protect, adminOnly, updateBook); // Admin only
router.delete("/:id", protect, adminOnly, deleteBook); // Admin only

module.exports = router;
