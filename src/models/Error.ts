export class HttpError extends Error {
    status: number;
    message: string;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}

export class UserNotFoundException extends HttpError {
    constructor(id: number) {
        super(400, `Invalid user id: ${id}`);
    }
}

export class InvalidTokenException extends HttpError {
    constructor() {
        super(401, `Invalid token`);
    }
}

export class MissingTokenException extends HttpError {
    constructor() {
        super(401, `Token is missing`);
    }
}
