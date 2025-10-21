import axiosInstance from "./axios";

// Base API URL
const API_BASE_URL = "/auth";

// Interface for clearing officer response (only firstName and lastName)
export interface ClearingOfficer {
  firstName: string;
  lastName: string;
}

// Interface for full clearing officer data from database (for reference)
interface ClearingOfficerFullData {
  schoolId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  refreshToken?: string;
}

// Clearing Officer Service
export const clearingOfficerService = {
  /**
   * Get all clearing officers (returns only firstName and lastName)
   * @returns Promise<ClearingOfficer[]>
   */
  getAllClearingOfficers: async (): Promise<ClearingOfficer[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/getAllCoInASCS`
      );

      // Handle different response formats
      let data: ClearingOfficerFullData[];
      if (response.data.success && response.data.data) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else {
        throw new Error("Invalid response format");
      }

      // Extract only firstName and lastName
      return data.map((officer: ClearingOfficerFullData) => ({
        firstName: officer.firstName,
        lastName: officer.lastName,
      }));
    } catch (error) {
      console.error("Error fetching clearing officers:", error);
      throw new Error("Failed to fetch clearing officers");
    }
  },

  /**
   * Get clearing officer by ID (returns only firstName and lastName)
   * @param id - Officer ID
   * @returns Promise<ClearingOfficer>
   */
  getClearingOfficerById: async (id: string): Promise<ClearingOfficer> => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/clearing-officers/${id}`
      );

      let data: ClearingOfficerFullData;
      if (response.data.success && response.data.data) {
        data = response.data.data;
      } else {
        data = response.data;
      }

      // Extract only firstName and lastName
      return {
        firstName: data.firstName,
        lastName: data.lastName,
      };
    } catch (error) {
      console.error("Error fetching clearing officer:", error);
      throw new Error("Failed to fetch clearing officer");
    }
  },
};

export default clearingOfficerService;
