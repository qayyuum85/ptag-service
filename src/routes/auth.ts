import { Router } from 'express';
import { login, logout, refreshToken } from '../controllers/auth';
import { registerUser } from '../controllers/register';

const router = Router();

router.post('/login', login);
router.get('/logout', logout);
router.post('/register', registerUser);
router.get('/refresh-token', refreshToken);

export default router;
