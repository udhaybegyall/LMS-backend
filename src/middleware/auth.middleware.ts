import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.user = { id: user.id, username: user.username, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

export const libraryMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'LIBRARIAN') {
    res.status(403).json({ error: 'Access denied. Librarian role required.' });
    return;
  }
  next();
};