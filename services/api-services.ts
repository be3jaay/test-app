/* eslint-disable @typescript-eslint/no-explicit-any */

import apiClient from "./api";

class ApiService {
  static async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const { data } = await apiClient.get<T>(url, { params });
    return data;
  }

  static async post<T>(url: string, body: Record<string, any>): Promise<T> {
    const { data } = await apiClient.post<T>(url, body);
    return data;
  }

  static async put<T>(url: string, body: Record<string, any>): Promise<T> {
    const { data } = await apiClient.put<T>(url, body);
    return data;
  }

  static async delete<T>(url: string, body?: Record<string, any>): Promise<T> {
    const { data } = await apiClient.delete<T>(url, body);
    return data;
  }

  static async patch<T>(url: string, body?: Record<string, any>): Promise<T> {
    const { data } = await apiClient.patch<T>(url, body);
    return data;
  }
}

export default ApiService;