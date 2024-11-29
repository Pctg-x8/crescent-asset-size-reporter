export class UnexpectedNullError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export function expectNonNull<T>(
    value: T | undefined,
    message: string
): NonNullable<T> {
    if (value === undefined || value === null) {
        throw new UnexpectedNullError(message);
    }

    return value;
}
