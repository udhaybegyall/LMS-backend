import express from 'express';
import { BookController } from '../controllers/book.controller';
import { authMiddleware, libraryMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authMiddleware, BookController.getAllBooks);
router.post('/', authMiddleware, libraryMiddleware, BookController.addBook);
router.put('/:id', authMiddleware, libraryMiddleware, BookController.updateBook);
router.delete('/:id', authMiddleware, libraryMiddleware, BookController.removeBook);
router.post('/:id/borrow', authMiddleware, BookController.borrowBook);
router.post('/:id/return', authMiddleware, BookController.returnBook);

export default router;