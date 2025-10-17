import axios from "./axios";
import type {
  Enrollment,
  Student,
  Section,
  Semester,
} from "../types/enrollment";

// Base URL for enrollment endpoints
const ENROLLMENT_BASE_URL = "/enroll";

// Enrollment API Service
export const enrollmentService = {
  // Get all enrollments
  getAllEnrollments: async (): Promise<Enrollment[]> => {
    try {
      const response = await axios.get(
        `${ENROLLMENT_BASE_URL}/getAllEnrollments`
      );
      console.log("getAllEnrollments response:", response.data);

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      throw error;
    }
  },

  // Create new enrollment
  createEnrollment: async (enrollmentData: {
    studentId: string;
    sectionId: string;
    semesterId: string;
    status?: string;
    grade?: string;
    remarks?: string;
  }): Promise<Enrollment> => {
    try {
      const payload = {
        studentId: enrollmentData.studentId,
        sectionId: enrollmentData.sectionId,
        semesterId: enrollmentData.semesterId,
        status: enrollmentData.status || "Enrolled",
        grade: enrollmentData.grade || "",
        remarks: enrollmentData.remarks || "",
        enrollmentDate: new Date().toISOString(),
      };

      console.log("Creating enrollment with payload:", payload);
      const response = await axios.post(
        `${ENROLLMENT_BASE_URL}/createEnrollment`,
        payload
      );
      console.log("createEnrollment response:", response.data);

      return response.data.data || response.data;
    } catch (error) {
      console.error("Error creating enrollment:", error);
      throw error;
    }
  },

  // Update enrollment
  updateEnrollment: async (
    id: string,
    updateData: {
      status?: string;
      grade?: string;
      remarks?: string;
    }
  ): Promise<Enrollment> => {
    try {
      const payload = {
        ...updateData,
        dateUpdated: new Date().toISOString(),
      };

      console.log(`Updating enrollment ${id} with payload:`, payload);
      const response = await axios.put(
        `${ENROLLMENT_BASE_URL}/updateEnrollment/${id}`,
        payload
      );
      console.log("updateEnrollment response:", response.data);

      return response.data.data || response.data;
    } catch (error) {
      console.error("Error updating enrollment:", error);
      throw error;
    }
  },

  // Delete enrollment
  deleteEnrollment: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting enrollment ${id}`);
      const response = await axios.delete(
        `${ENROLLMENT_BASE_URL}/deleteEnrollment/${id}`
      );
      console.log("deleteEnrollment response:", response.data);
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      throw error;
    }
  },

  // Get students (for enrollment modal)
  getStudents: async (): Promise<Student[]> => {
    try {
      const response = await axios.get("/student-management/getAllStudents");
      console.log("getStudents response:", response.data);

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected students response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get sections (for enrollment modal)
  getSections: async (): Promise<Section[]> => {
    try {
      const response = await axios.get("/sections/getAllSections");
      console.log("getSections response:", response.data);

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected sections response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get semesters (for enrollment modal)
  getSemesters: async (): Promise<Semester[]> => {
    try {
      const response = await axios.get("/semester-management/getAllSemesters");
      console.log("getSemesters response:", response.data);

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected semesters response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
      // Return empty array as fallback
      return [];
    }
  },
};

export default enrollmentService;
