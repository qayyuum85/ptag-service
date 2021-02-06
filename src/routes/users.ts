import { create } from 'domain';
import { Router } from 'express';
import { createUser, getUsers, getUserById, updateUser } from '../controllers/users';

const router = Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById)

router.patch('/:id', updateUser);
router.delete('/:id');

export default router;
