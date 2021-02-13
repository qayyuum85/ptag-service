import { Router } from 'express';
import { login, logout } from '../controllers/auth';

const router = Router();

router.post('/login', login);
router.get('/logout', logout);

export default router;
