import { User } from "@prisma/client";
import { Request } from "express";
import { Role } from "../controllers/userRole";

export interface UserTokenData {
    token: string;
    expiresIn: number;
}

export interface DataStoredInToken {
    userId: number;
    email: string;
    roles: Role[];
}

export interface RequestWithUser extends Request {
    user: User
}