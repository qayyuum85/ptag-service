import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';

import usersRoutes from './routes/users';

const app = express();
app.use(json());

app.use('/users', usersRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ message: err.message });
});

app.listen(7070, () => {
    console.log(`Server is running at port 7070`);
});
