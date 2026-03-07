import { TRegisterData } from "./types";
import ApiService from "../api-services";

const API_BASE = "https://code-camp-hackathon-be.onrender.com/api";

export type RegisterResponse = { access_token?: string };

async function register(data: TRegisterData): Promise<RegisterResponse> {
  try {
    const response = await ApiService.post<RegisterResponse>(`${API_BASE}/auth/signup`, {
      email: data.email,
      password: data.password,
      role: data.role,
    });
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/** API returns { success, data: { _id, email, role, token } } */
export type LoginApiResponse = {
  success: boolean;
  data: { _id: string; email: string; role: string; token: string };
};

export type LoginResponse = { access_token: string; role: string };

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
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { register, login };
