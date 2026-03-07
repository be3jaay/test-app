import { TRegisterData } from "./types";
import ApiService from "../api-services";

async function register(data: TRegisterData) {
  try {
    const response = await ApiService.post(
      `https://code-camp-hackathon-be.onrender.com/api/auth/signup`,
      {
        email: data.email,
        password: data.password,
        role: data.role,
      },
    );
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { register };
