import axios from "./axios";
import { AxiosError } from "axios";
import type {
  Enrollment,
  Student,
  Section,
  Semester,
  Course,
  StudentEnrollment,
  CreateStudentEnrollmentForm,
  UpdateStudentEnrollmentForm,
} from "../types/enrollment";

// Base URL for enrollment endpoints
const ENROLLMENT_BASE_URL = "/enroll";

// Interface for raw API response data
interface RawEnrollmentData {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  courseCode?: string;
  courseName?: string;
  studentNumber?: string;
  schoolId?: string;
  department?: string;
  yearLevel?: string;
  semester?: string;
  academicYear?: string;
  selectedCourses?: string[];
  prerequisites?: string[]; // Course codes stored in prerequisites array
  totalUnits?: number;
  units?: number;
  status?: string;
  instructor?: string;
  day?: string;
  timeStart?: string;
  timeEnd?: string;
  room?: string;
  schedule?: unknown[];
  createdAt?: string;
  dateCreated?: string;
}

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
    firstName: string;
    lastName: string;
    department: string;
    yearLevel: string;
    semester: string;
    academicYear: string;
    selectedCourses: string[];
    day: string;
    timeStart: string;
    timeEnd: string;
    room: string;
    instructor: string;
    totalUnits: number;
    status?: string;
    createdAt: string;
    updatedAt: string;
  }): Promise<Enrollment> => {
    try {
      const payload = {
        studentId: enrollmentData.studentId,
        firstName: enrollmentData.firstName,
        lastName: enrollmentData.lastName,
        department: enrollmentData.department,
        yearLevel: enrollmentData.yearLevel,
        semester: enrollmentData.semester,
        academicYear: enrollmentData.academicYear,
        selectedCourses: enrollmentData.selectedCourses,
        day: enrollmentData.day,
        timeStart: enrollmentData.timeStart,
        timeEnd: enrollmentData.timeEnd,
        room: enrollmentData.room,
        instructor: enrollmentData.instructor,
        totalUnits: enrollmentData.totalUnits,
        status: enrollmentData.status || "Enrolled",
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
      studentId?: string;
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
      const response = await axios.get("/enroll/getAllEnrollments");

      let data = [];
      // Handle different response formats
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else {
        console.warn("Unexpected response format for student enrollments");
        return [];
      }

      // Transform data to match StudentEnrollment interface
      return data.map((item: RawEnrollmentData) => {
        // Get course codes from prerequisites array or selectedCourses
        let courseCodes: string[] = [];

        if (item.prerequisites && Array.isArray(item.prerequisites)) {
          // Include all course codes from prerequisites array, with better validation
          courseCodes = item.prerequisites
            .filter(
              (code) => typeof code === "string" && code.trim().length > 0
            )
            .map((code) => code.trim());

          console.log(
            `Enrollment ${item.id}: Found ${item.prerequisites.length} prerequisites, ${courseCodes.length} course codes:`,
            courseCodes
          );
        } else if (
          item.selectedCourses &&
          Array.isArray(item.selectedCourses)
        ) {
          courseCodes = item.selectedCourses;
        }

        return {
          id: item.id || item._id,
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          middleName: item.middleName || "",
          email: item.email || "",
          courseCode: item.courseCode || "",
          courseName: item.courseName || "",
          studentNumber: item.studentNumber || "",
          schoolId: item.schoolId || "",
          department: item.department || "",
          yearLevel: item.yearLevel || "",
          semester: item.semester || "",
          academicYear: item.academicYear || "",
          selectedCourses: courseCodes, // Use filtered course codes from prerequisites
          totalUnits: item.totalUnits || item.units || 0,
          status: item.status || "Enrolled",
          instructor: item.instructor || "",
          day: item.day || "",
          timeStart: item.timeStart || "",
          timeEnd: item.timeEnd || "",
          room: item.room || "",
          units: item.units || 0,
          schedule: item.schedule || [],
          createdAt:
            item.createdAt || item.dateCreated || new Date().toISOString(),
        };
      });
    } catch (error: unknown) {
      console.error("Error fetching student enrollments:", error);
      throw error;
    }
  },

  // Create new student enrollment with multiple courses in prerequisites array
  createStudentEnrollment: async (
    enrollmentData: CreateStudentEnrollmentForm
  ): Promise<StudentEnrollment> => {
    try {
      console.log(
        "Creating single enrollment with multiple courses:",
        enrollmentData
      );

      // Validate required fields before sending
      const requiredFields = {
        schoolId: enrollmentData.schoolId,
        firstName: enrollmentData.firstName,
        lastName: enrollmentData.lastName,
        department: enrollmentData.department,
        selectedCourses: enrollmentData.selectedCourses,
      };

      console.log("Required fields validation:", requiredFields);

      // Check for missing required fields
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => {
          if (key === "selectedCourses") {
            return !Array.isArray(value) || value.length === 0;
          }
          return !value || value === "";
        })
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Extract course codes from selected courses to store in prerequisites array
      const courseCodesArray: string[] = [];
      let totalUnits = 0;
      let primaryCourse = { courseCode: "", courseName: "", units: 0 };

      // Parse all selected courses and extract course codes
      enrollmentData.selectedCourses.forEach((courseString, index) => {
        // Parse course information from string format: "CC107 - Programming 1 (6 units)"
        const courseMatch = courseString.match(
          /^([A-Za-z]+(?:\s+[A-Za-z]+)*(?:\s*\d{1,3}[A-Za-z0-9-]*)?)\s*-\s*(.+?)\s*\((\d+)\s+units?\)$/i
        );

        if (!courseMatch) {
          throw new Error(
            `Invalid course format: "${courseString}". Expected formats include "GEC 7 - Understanding The Self (3 units)", "CC102 - Programming (3 units)", or "MSM 12 - Business Math (3 units)".`
          );
        }

        const courseCode = courseMatch[1].trim();
        const courseName = courseMatch[2].trim();
        const units = parseInt(courseMatch[3], 10);

        // Add course code to prerequisites array
        courseCodesArray.push(courseCode);
        totalUnits += units;

        // Use first course as primary course info
        if (index === 0) {
          primaryCourse = { courseCode, courseName, units };
        }

        console.log(
          `Added course to prerequisites: ${courseCode} (${units} units)`
        );
      });

      console.log("Course codes for prerequisites array:", courseCodesArray);
      console.log("Total units calculated:", totalUnits);

      // Build single payload with all courses in prerequisites array
      const payload = {
        // Student Information (required)
        schoolId: enrollmentData.schoolId,
        firstName: enrollmentData.firstName,
        lastName: enrollmentData.lastName,
        middleName: enrollmentData.middleName || "",

        // Primary Course Information (use first selected course)
        courseCode: primaryCourse.courseCode,
        courseName: primaryCourse.courseName,
        description:
          enrollmentData.description ||
          `Multiple course enrollment: ${courseCodesArray.join(", ")}`,
        units: totalUnits, // Total units from all courses
        department: enrollmentData.department,

        // IMPORTANT: Store all selected course codes in prerequisites array
        prerequisites: courseCodesArray,

        // Schedule Information (optional with proper defaults)
        maxCapacity: enrollmentData.maxCapacity || 30,
        day: enrollmentData.day || "",
        timeStart: enrollmentData.timeStart || "",
        timeEnd: enrollmentData.timeEnd || "",
        room: enrollmentData.room || "",
        instructor: enrollmentData.instructor || "",

        // Academic Information
        semester: `${enrollmentData.semester}`,
        yearLevel: enrollmentData.yearLevel,
        status: "Enrolled",

        // Include selected courses array for reference
        selectedCourses: enrollmentData.selectedCourses,
        totalUnits: totalUnits,
      };

      console.log(
        "Sending single enrollment payload with prerequisites array:",
        payload
      );
      console.log(
        `Prerequisites array contains ${courseCodesArray.length} course codes:`,
        courseCodesArray
      );

      const response = await axios.post(
        `${ENROLLMENT_BASE_URL}/createEnrollment`,
        payload
      );

      console.log("API Response for single enrollment:", response.data);
      console.log(
        `Successfully created 1 enrollment record with ${courseCodesArray.length} courses in prerequisites array`
      );

      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error("Error creating student enrollment:", error);
      if (error instanceof AxiosError && error.response) {
        console.error("Server response status:", error.response.status);
        console.error("Server response data:", error.response.data);
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
      // Calculate total units and derive prerequisites (course codes) if selectedCourses is being updated
      let totalUnits: number | undefined;
      let prerequisites: string[] | undefined;
      if (Array.isArray(updateData.selectedCourses)) {
        totalUnits = updateData.selectedCourses.reduce(
          (total, courseString) => {
            const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
            return total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0);
          },
          0
        );

        // Extract course codes from strings like "CC102 - Programming (3 units)"
        prerequisites = updateData.selectedCourses
          .map((courseString) => {
            const match = courseString.match(
              /^([A-Za-z]+(?:\s+[A-Za-z]+)*(?:\s*\d{1,3}[A-Za-z0-9-]*)?)\s*-\s*.+?\s*\(\d+\s+units?\)$/i
            );
            return match ? match[1].trim() : undefined;
          })
          .filter(
            (code): code is string =>
              typeof code === "string" && code.length > 0
          );
      }

      // Build payload - only include defined fields; also sync prerequisites and updatedAt
      const payload: Record<string, unknown> = {};

      if (updateData.firstName !== undefined)
        payload.firstName = updateData.firstName;
      if (updateData.lastName !== undefined)
        payload.lastName = updateData.lastName;
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
      if (prerequisites !== undefined) payload.prerequisites = prerequisites;
      if (totalUnits !== undefined) {
        payload.totalUnits = totalUnits;
        payload.units = totalUnits; // keep in sync for backends using `units`
      }
      payload.updatedAt = new Date().toISOString();

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

  // Get courses (for course selection in enrollment)
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await axios.get("/courses/getAllCourses");

      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn("Unexpected courses response format");
        return [];
      }
    } catch (error: unknown) {
      console.error("Error fetching courses:", error);
      // Return empty array as fallback
      return [];
    }
  },
};

export default enrollmentService;
