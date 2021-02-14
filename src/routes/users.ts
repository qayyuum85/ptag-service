import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser } from '../controllers/users';
import { handleCreateUserRole } from '../controllers/userRole';
import jwtMiddleware from '../middlewares/jwt';
const router = Router();

router.all('*', jwtMiddleware);

router.post('/', createUser);
router.get('/', jwtMiddleware, getUsers);
router.get('/:id', getUserById);
router.post('/:id/role', handleCreateUserRole);
router.patch('/:id', updateUser);
router.delete('/:id');

export default router;
