import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password, role } = req.body;

      if (!username || !password || !role) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (role !== 'LIBRARIAN' && role !== 'MEMBER') {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        res.status(400).json({ error: 'Username already exists' });
        return;
      }

      const user = await UserModel.create(username, password, role);
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

      res.status(201).json({ user: { id: user.id, username: user.username, role: user.role }, token });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await UserModel.findByUsername(username);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

      res.json({ user: { id: user.id, username: user.username, role: user.role }, token });
    } catch (error) {
      next(error);
    }
  }
}