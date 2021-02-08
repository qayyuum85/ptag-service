import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function ArrayContainsOneOf(validationOptions: ValidationOptions & { containsThis: string[] }) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'ArrayContainsOneOf',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string[], _args: ValidationArguments) {
                    return value.some((v) => validationOptions?.containsThis.includes(v));
                },
            },
        });
    };
}
