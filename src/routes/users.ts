import { create } from 'domain';
import { Router } from 'express';
import { createUser, getUser } from '../controllers/users';

const router = Router();

router.post('/', createUser);
router.get('/', getUser);

router.patch('/:id');
router.delete('/:id');

export default router;
