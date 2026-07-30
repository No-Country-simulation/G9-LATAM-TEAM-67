// src/services/authService.ts

import { API_URL } from "../config/api";
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
} from "../types/auth";

export async function login(
    request: LoginRequest
): Promise<LoginResponse> {

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error("Credenciales inválidas");
    }

    return await response.json();
}

export async function register(
    request: RegisterRequest
): Promise<void> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            error.message || "No fue posible registrar el usuario."
        );
    }
}
