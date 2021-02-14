import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import fingerprint from 'express-fingerprint';

import * as routes from './routes';
import { User } from '@prisma/client';

declare module 'express-serve-static-core' {
    interface Request {
        user: User;
    }
}

const app = express();
app.use(json());
app.use(cookieParser());
app.use(fingerprint());

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ health: 'OK' });
});

app.use('/', routes.authRouter);
app.use('/users', routes.userRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ message: err.message });
});

app.listen(7070, () => {
    console.log(`Server is running at port 7070`);
});
