// import { RegisterInput } from "@/schemas/authSchemas";

// export async function registerUserApi(values: RegisterInput) {
//   const res = await fetch("/api/auth/register", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(values),
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     throw new Error(data.error || "Registration failed");
//   }

//   return data;
// }

// src/client/api/auth.ts


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/auth/expert";

// Types for API responses
type AuthResponse = {
  message: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

// API Error handler
export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new AuthError(data.message || 'Request failed', response.status);
  }
  
  return data;
}

// 1. Register Expert
export async function registerUserApi(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<AuthResponse>(response);
}

// 2. Verify Email
export async function verifyEmailApi(token: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/verify?token=${token}`, {
    method: "GET",
  });

  return handleResponse<AuthResponse>(response);
}

// 3. Login
export async function loginUserApi(data: {
  identifier: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await handleResponse<LoginResponse>(response);
  
  // Store tokens in localStorage
  localStorage.setItem("access_token", result.access_token);
  localStorage.setItem("refresh_token", result.refresh_token);
  
  return result;
}

// 4. Refresh Token
export async function refreshTokenApi(): Promise<RefreshResponse> {
  const refreshToken = localStorage.getItem("refresh_token");
  
  if (!refreshToken) {
    throw new AuthError("No refresh token available", 401);
  }

  const response = await fetch(`${BASE_URL}/refresh`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${refreshToken}`
    },
  });

  const result = await handleResponse<RefreshResponse>(response);
  
  // Update tokens in localStorage
  localStorage.setItem("access_token", result.access_token);
  localStorage.setItem("refresh_token", result.refresh_token);
  
  return result;
}

// 5. Logout
export async function logoutApi(): Promise<AuthResponse> {
  const accessToken = localStorage.getItem("access_token");
  
  if (!accessToken) {
    throw new AuthError("No access token available", 401);
  }

  const response = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
  });

  // Clear tokens from localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  
  return handleResponse<AuthResponse>(response);
}

// 6. Forgot Password
export async function forgotPasswordApi(email: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return handleResponse<AuthResponse>(response);
}

// 7. Reset Password
export async function resetPasswordApi(token: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/reset-password?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  return handleResponse<AuthResponse>(response);
}

// 8. Google Login (redirect to Google)
export function googleLoginApi(): void {
  window.location.href = `${BASE_URL}/google?state=expert`;
}

// Google Register (same as Google Login for this API)
export function googleRegisterApi(): void {
  googleLoginApi();
}

// Helper function to get current access token
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("access_token");
}

// Helper function to get current refresh token
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("refresh_token");
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!getAccessToken();
}

