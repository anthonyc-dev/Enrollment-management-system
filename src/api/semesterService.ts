import axiosInstance from "./axios";
import type {
  Semester,
  CreateSemesterForm,
  ApiResponse,
} from "../types/enrollment";

// Database semester interface (matches actual database structure)
interface DatabaseSemester {
  _id?: string;
  id?: string;
  semesterName: string;
  academicYear: string;
  semesterType: "FIRST" | "SECOND" | "SUMMER";
  semesterDuration: string;
  enrollmentPeriod: string;
  status: "active" | "inactive" | "completed";
  createdAt?: string;
  updatedAt?: string;
  dateCreated?: string;
  dateUpdated?: string;
}

// Transform database semester to application semester
const transformSemester = (dbSemester: DatabaseSemester): Semester => {
  console.log("Transforming semester:", dbSemester); // Debug log
  
  // Handle different possible ID field names
  const id = dbSemester._id || dbSemester.id || '';
  
  if (!id) {
    console.error("No valid ID found in semester data:", dbSemester);
  }
  
  // Ensure all required fields are present with defaults
  const transformed: Semester = {
    id: id,
    semesterName: dbSemester.semesterName || '',
    academicYear: dbSemester.academicYear || '',
    semesterType: dbSemester.semesterType || 'FIRST',
    semesterDuration: dbSemester.semesterDuration || '',
    enrollmentPeriod: dbSemester.enrollmentPeriod || '',
    status: dbSemester.status || 'inactive',
    dateCreated: dbSemester.createdAt || dbSemester.dateCreated || new Date().toISOString(),
    dateUpdated: dbSemester.updatedAt || dbSemester.dateUpdated || new Date().toISOString(),
  };
  
  console.log("Transformed result:", transformed); // Debug log
  console.log("Final ID:", transformed.id); // Debug log
  return transformed;
};

// Semester API Services
export const semesterService = {
  // Get all semesters
  getAllSemesters: async (): Promise<Semester[]> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DatabaseSemester[]>>(
        "/semester-management/getAllSemesters"
      );

      console.log("Raw API response:", response.data); // Debug log

      // Handle different response structures
      let data: unknown = response.data.data || response.data;
      
      // If data is not an array, try to extract it from different possible structures
      if (!Array.isArray(data)) {
        console.log("Data is not array, checking for nested structure:", data);
        if (data && typeof data === 'object' && data !== null) {
          const dataObj = data as Record<string, unknown>;
          if (Array.isArray(dataObj.semesters)) {
            data = dataObj.semesters;
          } else if (Array.isArray(dataObj.data)) {
            data = dataObj.data;
          } else {
            console.warn("Unexpected data structure, defaulting to empty array:", data);
            data = [];
          }
        } else {
          console.warn("Data is not an object, defaulting to empty array:", data);
          data = [];
        }
      }

      const semesters = Array.isArray(data) ? data : [];
      console.log("Semesters before transformation:", semesters); // Debug log

      const transformedSemesters = semesters.map(transformSemester);
      console.log("Transformed semesters:", transformedSemesters); // Debug log

      return transformedSemesters;
    } catch (error) {
      console.error("Error fetching semesters:", error);
      throw error;
    }
  },

  // Get semester by ID
  getSemesterById: async (id: string): Promise<Semester> => {
    try {
      const response = await axiosInstance.get<ApiResponse<DatabaseSemester>>(
        `/semester-management/getSemesterById/${id}`
      );

      const data = response.data.data || response.data;
      return transformSemester(data);
    } catch (error) {
      console.error("Error fetching semester:", error);
      throw error;
    }
  },

  // Create new semester
  createSemester: async (
    semesterData: CreateSemesterForm
  ): Promise<Semester> => {
    try {
      console.log("Creating semester with data:", semesterData); // Debug log
      
      // Validate required fields before sending
      if (!semesterData.semesterName || !semesterData.academicYear || !semesterData.semesterType) {
        throw new Error("Missing required semester fields");
      }

      const response = await axiosInstance.post<ApiResponse<DatabaseSemester>>(
        "/semester-management/createSemester",
        {
          ...semesterData,
          status: "inactive" // Default status for new semesters
        }
      );

      console.log("Create semester response:", response.data); // Debug log
      const data = response.data.data || response.data;
      return transformSemester(data);
    } catch (error) {
      console.error("Error creating semester:", error);
      throw error;
    }
  },

  // Update semester
  updateSemester: async (
    id: string,
    semesterData: Partial<CreateSemesterForm> & { status?: Semester["status"] }
  ): Promise<Semester> => {
    try {
      console.log("updateSemester called with:", { id, semesterData }); // Debug log

      if (!id || id === "undefined") {
        throw new Error("Invalid semester ID provided");
      }

      const response = await axiosInstance.put<ApiResponse<DatabaseSemester>>(
        `/semester-management/updateSemester/${id}`,
        semesterData
      );

      console.log("Update response:", response.data); // Debug log
      const data = response.data.data || response.data;
      return transformSemester(data);
    } catch (error) {
      console.error("Error updating semester:", error);
      throw error;
    }
  },

  // Delete semester
  deleteSemester: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/semester-management/deleteSemester/${id}`);
    } catch (error) {
      console.error("Error deleting semester:", error);
      throw error;
    }
  },
};
