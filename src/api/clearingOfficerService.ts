import type { ClearingOfficer } from "@/types/enrollment";
import axiosInstance from "./axios";

const API_BASE_URL = "/auth";

export const clearingOfficerService = {
  // 🔹 Get all clearing officers
  getAll: async (): Promise<ClearingOfficer[]> => {
    const response = await axiosInstance.get(`${API_BASE_URL}/getAllCo`);
    return response.data;
  },

  // 🔹 Create new clearing officer
  create: async (
    data: Omit<ClearingOfficer, "id" | "createdAt" | "password" | "role">
  ): Promise<ClearingOfficer> => {
    console.log("API: Creating officer with data:", data);
    console.log("API: Endpoint:", `${API_BASE_URL}/createCo`);

    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/createCo`,
        data
      );
      console.log("API: Response:", response.data);
      return response.data.data; // backend returns { message, data }
    } catch (error: unknown) {
      console.error("API: Create officer error:", error);
      console.error(
        "API: Error response:",
        (error as { response?: { data?: unknown } }).response?.data
      );
      throw error;
    }
  },

  // 🔹 Update clearing officer
  update: async (
    id: string,
    updated: Partial<ClearingOfficer>
  ): Promise<ClearingOfficer> => {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/updateCo/${id}`,
      updated
    );
    return response.data.clearingOfficer; // backend returns { message, clearingOfficer }
  },

  // 🔹 Delete clearing officer
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_BASE_URL}/deleteCo/${id}`);
  },
};
