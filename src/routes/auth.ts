import { Router } from 'express';
import { login, logout, refreshToken } from '../controllers/auth';

const router = Router();

router.post('/login', login);
router.get('/logout', logout);
router.get('/refresh-token', refreshToken);

export default router;
