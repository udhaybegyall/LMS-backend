import pool from '../config/database';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  status: 'AVAILABLE' | 'BORROWED';
}

export class BookModel {
  static async create(title: string, author: string, isbn: string): Promise<Book> {
    const result = await pool.query(
      'INSERT INTO books (title, author, isbn, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, author, isbn, 'AVAILABLE']
    );
    return result.rows[0];
  }

  static async findAll(): Promise<Book[]> {
    const result = await pool.query('SELECT * FROM books');
    return result.rows;
  }

  static async findById(id: number): Promise<Book | null> {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(id: number, title: string, author: string, isbn: string): Promise<Book | null> {
    const result = await pool.query(
      'UPDATE books SET title = $1, author = $2, isbn = $3 WHERE id = $4 RETURNING *',
      [title, author, isbn, id]
    );
    return result.rows[0] || null;
  }

  // check this later for a fix result.rowCount!
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM books WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }

  static async updateStatus(id: number, status: 'AVAILABLE' | 'BORROWED'): Promise<Book | null> {
    const result = await pool.query(
      'UPDATE books SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }
}