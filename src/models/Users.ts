import { UserRole } from '@prisma/client';
import { IsDefined, IsEmail } from 'class-validator';
import { Role } from '../controllers/userRole';
import { ArrayContainsOneOf } from '../helper/ArrayContainsOneOf';
import { BaseUser, UserRegisterDtoI, UserResponse } from '../types/user';
import bcrypt from 'bcrypt';

export class UserRegisterDto implements UserRegisterDtoI {
    @IsDefined()
    firstName: string;

    @IsDefined()
    lastName: string;

    @IsDefined()
    @IsEmail()
    email: string;

    @IsDefined()
    address: string;

    @IsDefined()
    phone: string;

    @IsDefined({
        each: true,
    })
    @ArrayContainsOneOf({ containsThis: Object.keys(Role) })
    role: Role[];

    @IsDefined()
    password: string;

    constructor(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        address: string,
        phone: string,
        role: Role[]
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.address = address;
        this.phone = phone;
        this.role = role;
        this.password = password;
    }

    async getDto() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            address: this.address,
            email: this.email,
            phone: this.phone,
            role: this.role,
            password: await this.hashPassword(),
        };
    }

    private async hashPassword(): Promise<string> {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        return hashedPassword;
    }
}

export const UserColumnSelection = {
    id: true,
    firstName: true,
    lastName: true,
    address: true,
    email: true,
    phone: true,
    UserRole: true,
};

export const mapUserResponse = (
    user: BaseUser & {
        id: number;
        UserRole: UserRole[];
    }
): UserResponse => {
    const { id, firstName, lastName, email, phone, address } = user;
    return {
        id,
        firstName,
        lastName,
        email,
        phone,
        address,
        userRole: user.UserRole.map((r) => r.role as Role),
    };
};
