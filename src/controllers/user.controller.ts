import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { BorrowHistoryModel } from '../models/borrowHistory.model';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';

export class UserController {
  static async getAllMembers(req: Request, res: Response) {
    try {
      const members = await UserModel.getAllMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching members', error });
    }
  }

  static async getMemberBorrowHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const history = await UserModel.getMemberBorrowHistory(parseInt(id));
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching member borrow history', error });
    }
  }

  static async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await UserModel.create(username, password, 'MEMBER');
      res.status(201).json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async updateMember(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { username, password } = req.body;

      if (!username && !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await UserModel.findById(parseInt(id));
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (username) {
        user.username = username;
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      const updatedUser = await UserModel.update(user);
      res.json({ id: updatedUser.id, username: updatedUser.username, role: updatedUser.role });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async viewMember(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(parseInt(id));
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(parseInt(id));
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await UserModel.delete(parseInt(id));
      res.json({ message: 'Member removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async viewAllHistory(req: Request, res: Response): Promise<void> {
    try {
      const history = await BorrowHistoryModel.findAll();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async viewOwnHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await BorrowHistoryModel.findByUserId(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async viewActiveMembers(req: Request, res: Response): Promise<void> {
    try {
      const activeMembers = await UserModel.findALLActive();
      const filteredMembers = activeMembers.filter((member) => member.role === 'MEMBER');
      res.json(filteredMembers);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async viewDeletedMembers(req: Request, res: Response): Promise<void> {
    try {
      const deletedMembers = await UserModel.findAllDeleted();
      const filteredMembers = deletedMembers.map(({ id, username, role }) => ({ id, username, role }));
      res.json(filteredMembers);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async deleteOwnAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      await UserModel.delete(userId);
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}