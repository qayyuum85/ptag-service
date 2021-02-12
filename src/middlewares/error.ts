import { ErrorRequestHandler } from 'express';
import { HttpError } from '../models/Error';

export const errorHandler: ErrorRequestHandler = (error: HttpError, _req, res) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    res.status(status).send({
        status,
        message,
    });
};
