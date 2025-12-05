export interface SignInRequest {
    email: string;
    password: string;
}

export interface ValidationError {
    field: string;
    message: string;
}