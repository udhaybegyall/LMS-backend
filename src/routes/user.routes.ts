import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, libraryMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, libraryMiddleware, UserController.addMember);
router.put('/:id', authMiddleware, libraryMiddleware, UserController.updateMember);
router.get('/:id', authMiddleware, libraryMiddleware, UserController.viewMember);
router.delete('/:id', authMiddleware, libraryMiddleware, UserController.removeMember);
router.get('/history', authMiddleware, libraryMiddleware, UserController.viewAllHistory);
router.get('/history/own', authMiddleware, UserController.viewOwnHistory);
router.delete('/own', authMiddleware, UserController.deleteOwnAccount);

// vewing active and deleted mmembers
router.get('/active', authMiddleware, libraryMiddleware, UserController.viewActiveMembers);
router.get('/deleted', authMiddleware, libraryMiddleware, UserController.viewDeletedMembers);

export default router;