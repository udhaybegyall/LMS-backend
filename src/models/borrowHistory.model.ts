import pool from '../config/database';

export interface BorrowHistory {
  id: number;
  userId: number;
  bookId: number;
  borrowDate: Date;
  returnDate: Date | null;
}

export class BorrowHistoryModel {
  static async create(userId: number, bookId: number): Promise<BorrowHistory> {
    const result = await pool.query(
      'INSERT INTO borrow_history (user_id, book_id, borrow_date) VALUES ($1, $2, $3) RETURNING *',
      [userId, bookId, new Date()]
    );
    return result.rows[0];
  }

  static async findByUserId(userId: number): Promise<BorrowHistory[]> {
    const result = await pool.query('SELECT * FROM borrow_history WHERE user_id = $1', [userId]);
    return result.rows;
  }

  static async findAll(): Promise<BorrowHistory[]> {
    const result = await pool.query('SELECT * FROM borrow_history');
    return result.rows;
  }

  static async updateReturnDate(id: number): Promise<BorrowHistory | null> {
    const result = await pool.query(
      'UPDATE borrow_history SET return_date = $1 WHERE id = $2 RETURNING *',
      [new Date(), id]
    );
    return result.rows[0] || null;
  }
}