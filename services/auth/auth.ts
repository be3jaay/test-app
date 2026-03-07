import { TRegisterData } from "./types";
import ApiService from "../api-services";

const API_BASE = "https://code-camp-hackathon-be.onrender.com/api";

/** Signup API may return { success, data: { token, role, has_completed } } or flat */
export type RegisterApiResponse =
  | { success?: boolean; data?: { token?: string; role?: string; has_completed?: boolean } }
  | { access_token?: string };

export type RegisterResponse = {
  access_token?: string;
  role?: string;
  has_completed: boolean;
};

async function register(data: TRegisterData): Promise<RegisterResponse> {
  try {
    const response = await ApiService.post<RegisterApiResponse>(`${API_BASE}/auth/signup`, {
      email: data.email,
      password: data.password,
      role: data.role,
    });
    const raw = response as RegisterApiResponse;
    const withData = raw && "data" in raw ? raw : null;
    const token =
      withData?.data?.token ?? (raw as { access_token?: string }).access_token;
    const role = withData?.data?.role ?? data.role;
    const has_completed = withData?.data?.has_completed ?? false;
    return {
      access_token: token,
      role,
      has_completed,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/** API returns { success, data: { _id, email, role, has_completed, token } } */
export type LoginApiResponse = {
  success: boolean;
  data: {
    _id: string;
    email: string;
    role: string;
    token: string;
    has_completed?: boolean;
  };
};

export type LoginResponse = {
  access_token: string;
  role: string;
  has_completed: boolean;
};

async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await ApiService.post<LoginApiResponse>(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    if (!response?.data?.token) {
      throw new Error("Invalid login response");
    }
    return {
      access_token: response.data.token,
      role: response.data.role ?? "Client",
      has_completed: response.data.has_completed ?? true,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { register, login };
