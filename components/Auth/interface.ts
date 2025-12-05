import { User } from "@/types";


export interface SignInRequest {
    email: string;
    password: string;
}

export interface ValidationError {
    field: string;
    message: string;
}


export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  user: User;
  token: string;  // Chỉ có access token
}
