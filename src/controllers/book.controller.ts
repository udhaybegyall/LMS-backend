import { Request, Response } from 'express';
import { BookModel } from '../models/book.model';
import { BorrowHistoryModel } from '../models/borrowHistory.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class BookController {
  static async addBook(req: Request, res: Response): Promise<void> {
    try {
      const { title, author, isbn } = req.body;

      if (!title || !author || !isbn) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const book = await BookModel.create(title, author, isbn);
      res.status(201).json(book);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, author, isbn } = req.body;

      if (!title || !author || !isbn) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const book = await BookModel.update(parseInt(id), title, author, isbn);
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async removeBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await BookModel.delete(parseInt(id));
      if (!success) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      res.json({ message: 'Book removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async getAllBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BookModel.findAll();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async borrowBook(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const book = await BookModel.findById(parseInt(id));
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      if (book.status === 'BORROWED') {
        res.status(400).json({ error: 'Book is already borrowed' });
        return;
      }

      await BookModel.updateStatus(book.id, 'BORROWED');
      await BorrowHistoryModel.create(userId, book.id);

      res.json({ message: 'Book borrowed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async returnBook(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const book = await BookModel.findById(parseInt(id));
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      if (book.status === 'AVAILABLE') {
        res.status(400).json({ error: 'Book is already available' });
        return;
      }

      await BookModel.updateStatus(book.id, 'AVAILABLE');
      const borrowHistory = await BorrowHistoryModel.findByUserId(userId);
      const currentBorrow = borrowHistory.find(bh => bh.bookId === book.id && !bh.returnDate);

      if (currentBorrow) {
        await BorrowHistoryModel.updateReturnDate(currentBorrow.id);
      }

      res.json({ message: 'Book returned successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}