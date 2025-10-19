import axios from "./axios";
import { AxiosError } from "axios";
import type {
  Enrollment,
  Student,
  Section,
  Semester,
  StudentEnrollment,
  CreateStudentEnrollmentForm,
  UpdateStudentEnrollmentForm,
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

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected response format for enrollments");
        return [];
      }
    } catch (error: unknown) {
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

      const response = await axios.post(
        `${ENROLLMENT_BASE_URL}/createEnrollment`,
        payload
      );

      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error("Error creating enrollment:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("Server response status:", error.response.status);
      }
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

      const response = await axios.put(
        `${ENROLLMENT_BASE_URL}/updateEnrollment/${id}`,
        payload
      );

      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error("Error updating enrollment:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("Server response status:", error.response.status);
      }
      throw error;
    }
  },

  // Delete enrollment
  deleteEnrollment: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${ENROLLMENT_BASE_URL}/deleteEnrollment/${id}`);
    } catch (error: unknown) {
      console.error("Error deleting enrollment:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("Server response status:", error.response.status);
      }
      throw error;
    }
  },

  // Get students (for enrollment modal)
  getStudents: async (): Promise<Student[]> => {
    try {
      const response = await axios.get("/student-management/getAllStudents");

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected students response format");
        return [];
      }
    } catch (error: unknown) {
      console.error("Error fetching students:", error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get sections (for enrollment modal)
  getSections: async (): Promise<Section[]> => {
    try {
      const response = await axios.get("/sections/getAllSections");

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected sections response format");
        return [];
      }
    } catch (error: unknown) {
      console.error("Error fetching sections:", error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get semesters (for enrollment modal)
  getSemesters: async (): Promise<Semester[]> => {
    try {
      const response = await axios.get("/semester-management/getAllSemesters");

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected semesters response format");
        return [];
      }
    } catch (error: unknown) {
      console.error("Error fetching semesters:", error);
      // Return empty array as fallback
      return [];
    }
  },

  // StudentEnrollment CRUD Methods
  // Get all student enrollments
  getAllStudentEnrollments: async (): Promise<StudentEnrollment[]> => {
    try {
      const response = await axios.get(
        `${ENROLLMENT_BASE_URL}/getAllEnrollments`
      );

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected response format for student enrollments");
        return [];
      }
    } catch (error: unknown) {
      console.error("Error fetching student enrollments:", error);
      throw error;
    }
  },

  // Create new student enrollment
  createStudentEnrollment: async (
    enrollmentData: CreateStudentEnrollmentForm
  ): Promise<StudentEnrollment> => {
    try {
      // Calculate total units from selected courses
      const totalUnits = enrollmentData.selectedCourses.reduce(
        (total, courseString) => {
          // Extract units from course string format: "CS201 - Data Structures and Algorithms (3 units)"
          const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
          return total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0);
        },
        0
      );

      const payload = {
        name: enrollmentData.name,
        studentNumber: enrollmentData.studentNumber,
        department: enrollmentData.department,
        yearLevel: enrollmentData.yearLevel,
        semester: enrollmentData.semester,
        academicYear: enrollmentData.academicYear,
        selectedCourses: enrollmentData.selectedCourses,
        totalUnits,
        createdAt: new Date().toISOString(),
      };

      const response = await axios.post(
        `${ENROLLMENT_BASE_URL}/createEnrollment`,
        payload
      );

      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error("Error creating student enrollment:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("Server response status:", error.response.status);
      }
      throw error;
    }
  },

  // Update student enrollment
  updateStudentEnrollment: async (
    id: string,
    updateData: UpdateStudentEnrollmentForm
  ): Promise<StudentEnrollment> => {
    try {
      // Calculate total units if selectedCourses is being updated
      let totalUnits: number | undefined;
      if (updateData.selectedCourses) {
        totalUnits = updateData.selectedCourses.reduce(
          (total, courseString) => {
            const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
            return total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0);
          },
          0
        );
      }

      // Clean payload - only include defined fields
      const payload: Partial<StudentEnrollment> = {};

      if (updateData.name !== undefined) payload.name = updateData.name;
      if (updateData.studentNumber !== undefined)
        payload.studentNumber = updateData.studentNumber;
      if (updateData.department !== undefined)
        payload.department = updateData.department;
      if (updateData.yearLevel !== undefined)
        payload.yearLevel = updateData.yearLevel;
      if (updateData.semester !== undefined)
        payload.semester = updateData.semester;
      if (updateData.academicYear !== undefined)
        payload.academicYear = updateData.academicYear;
      if (updateData.selectedCourses !== undefined)
        payload.selectedCourses = updateData.selectedCourses;
      if (totalUnits !== undefined) payload.totalUnits = totalUnits;

      const response = await axios.put(
        `${ENROLLMENT_BASE_URL}/updateEnrollment/${id}`,
        payload
      );

      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error("Error updating student enrollment:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("Server response status:", error.response.status);
      }
      throw error;
    }
  },

  // Delete student enrollment
  deleteStudentEnrollment: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${ENROLLMENT_BASE_URL}/deleteEnrollment/${id}`);
    } catch (error: unknown) {
      console.error("Error deleting student enrollment:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("Server response status:", error.response.status);
      }
      throw error;
    }
  },
};

export default enrollmentService;
