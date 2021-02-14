import { Role } from '../controllers/userRole';

export interface BaseUser {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
}

export type UserResponse = BaseUser & {
    id: number;
    userRole: Role[];
};

export type UserRegisterDtoI = BaseUser & {
    role: Role[];
};
