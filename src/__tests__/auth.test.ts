// src/__tests__/auth.test.ts
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

jest.mock('../models/user.model');
jest.mock('jsonwebtoken');

describe('Authentication Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'MEMBER',
      };

      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.findByUsername as jest.Mock).mockResolvedValue(null);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const response = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'testuser', password: 'password123', role: 'MEMBER' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        user: {
          id: 1,
          username: 'testuser',
          role: 'MEMBER',
        },
        token: 'mock_token',
      });
    });

    it('should return 400 if username already exists', async () => {
      (UserModel.findByUsername as jest.Mock).mockResolvedValue({ id: 1, username: 'testuser' });

      const response = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'testuser', password: 'password123', role: 'MEMBER' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Username already exists' });
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing required fields' });
    });

    it('should return 400 if role is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'testuser', password: 'password123', role: 'INVALID_ROLE' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid role' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return a token', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'MEMBER',
      };

      (UserModel.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: {
          id: 1,
          username: 'testuser',
          role: 'MEMBER',
        },
        token: 'mock_token',
      });
    });

    it('should return 401 if user is not found', async () => {
      (UserModel.findByUsername as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistentuser', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 401 if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'MEMBER',
      };

      (UserModel.findByUsername as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing required fields' });
    });
  });
});