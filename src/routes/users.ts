import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser } from '../controllers/users';
import { handleCreateUserRole } from '../controllers/userRole';
import jwtMiddleware from '../middlewares/jwt';
const router = Router();

router.post('/register', createUser);
router.get('/', jwtMiddleware, getUsers);
router.get('/:id', getUserById);
router.post('/:id/role', handleCreateUserRole);

router.patch('/:id', updateUser);
router.delete('/:id');

export default router;
