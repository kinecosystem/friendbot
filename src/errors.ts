export type ApiError = {
    code: number;
    error: string;
    message: string;
};

export class ClientError extends Error {
    public readonly title: string;
    public readonly status: number; // http status code
    public readonly code: number; // our own internal codes

    constructor(status: number, index: number, title: string, message: string) {
        super(message);
        this.code = Number(status + "" + index);
        this.title = title;
        this.status = status;
    }


    public toJson(): ApiError {
        return {
            code: this.code,
            error: this.title,
            message: this.message
        };
    }

    public toString(): string {
        return JSON.stringify(this.toJson());
    }
}

export class BadRequest extends ClientError {
    constructor(message: string) {
        super(400, 1, "Bad Request", message);
    }
}