import  pool from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'LIBRARIAN' | 'MEMBER';
  is_active: boolean;
}

export class UserModel {
  static async getAllMembers() {
    const query = 'SELECT id, username, email, role, is_deleted FROM users';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getMemberBorrowHistory(userId: number) {
    const query = `
      SELECT bh.id, b.title, bh.borrow_date, bh.return_date
      FROM borrow_history bh
      JOIN books b ON bh.book_id = b.id
      WHERE bh.user_id = $1
      ORDER BY bh.borrow_date DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async create(username: string, password: string, role: 'LIBRARIAN' | 'MEMBER'): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, role, is_active) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, hashedPassword, role, true]
    );
    return result.rows[0];
  }

  static async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async update(user: User): Promise<User> {
    const result = await pool.query(
      'UPDATE users SET username = $1, password = $2, role = $3, is_active = $4 WHERE id = $5 RETURNING *',
      [user.username, user.password, user.role, user.is_active, user.id]
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }

  static async findALLActive(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users WHERE is_active = $1', [true]);
    return result.rows;
  }

  static async findAllDeleted(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users WHERE is_active = $1', [false]);
    return result.rows;
  }
}