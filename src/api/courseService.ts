import axiosInstance from "./axios";
import type {
  Course,
  Section,
  CreateCourseForm,
  CreateSectionForm,
  StudentEnrollment,
  CreateStudentEnrollmentForm,
  UpdateStudentEnrollmentForm,
} from "../types/enrollment";

// Normalizers to tolerate backend shape differences
type Raw = Record<string, unknown>;

const asRaw = (v: unknown): Raw | undefined =>
  v && typeof v === "object" ? (v as Raw) : undefined;

const getString = (r: Raw, key: string, fallback = ""): string => {
  const v = r[key];
  return typeof v === "string" ? v : v != null ? String(v) : fallback;
};

const getNumber = (r: Raw, key: string, fallback = 0): number => {
  const v = r[key];
  const n = typeof v === "number" ? v : v != null ? Number(v) : fallback;
  return Number.isFinite(n) ? n : fallback;
};

const getStringArray = (r: Raw, key: string): string[] => {
  const v = r[key];
  return Array.isArray(v) ? v.map((x) => String(x)) : [];
};

function normalizeCourse(rawUnknown: unknown): Course {
  const raw = asRaw(rawUnknown) ?? {};
  const id = getString(raw, "id") || getString(raw, "_id");
  return {
    id,
    courseCode: getString(raw, "courseCode", "-"),
    courseName: getString(raw, "courseName", "-"),
    description: (raw["description"] as string) ?? "",
    units: getNumber(raw, "units", 0),
    department: getString(raw, "department", ""),
    prerequisites: getStringArray(raw, "prerequisites"),

    // Section-specific fields
    maxCapacity: getNumber(raw, "maxCapacity"),
    day: getString(raw, "day") || undefined,
    timeStart: getString(raw, "timeStart") || undefined,
    timeEnd: getString(raw, "timeEnd") || undefined,
    room: getString(raw, "room") || undefined,
    instructor: getString(raw, "instructor") || undefined,
    semester: getString(raw, "semester") || undefined,
    yearLevel: getString(raw, "yearLevel") || undefined,

    status: (getString(raw, "status") as "Active" | "Inactive") || undefined,
    dateCreated:
      getString(raw, "createdAt") ||
      getString(raw, "dateCreated") ||
      new Date().toISOString(),
    dateUpdated:
      getString(raw, "updatedAt") ||
      getString(raw, "dateUpdated") ||
      new Date().toISOString(),
  };
}

function normalizeSection(rawUnknown: unknown): Section {
  const raw = asRaw(rawUnknown) ?? {};
  const id = getString(raw, "id") || getString(raw, "_id");
  const hasFlat = Boolean(raw["day"] && raw["timeStart"] && raw["timeEnd"]);
  const schedule = Array.isArray(raw["schedule"])
    ? (raw["schedule"] as unknown[]).map((s) => {
        const rs = asRaw(s) ?? {};
        return {
          day: getString(rs, "day") as Section["schedule"][number]["day"],
          startTime: getString(rs, "startTime"),
          endTime: getString(rs, "endTime"),
          room: (rs["room"] as string) || undefined,
        };
      })
    : hasFlat
    ? [
        {
          day: getString(raw, "day") as Section["schedule"][number]["day"],
          startTime: getString(raw, "timeStart", "00:00"),
          endTime: getString(raw, "timeEnd", "00:00"),
          room: (raw["room"] as string) || undefined,
        },
      ]
    : [];

  const rawCourse = asRaw(raw["course"]);
  const courseId =
    getString(raw, "courseId") ||
    (rawCourse
      ? getString(rawCourse, "id") || getString(rawCourse, "_id")
      : "");

  return {
    id,
    sectionCode: getString(raw, "sectionCode", "-"),
    sectionName: getString(raw, "sectionName", "-"),
    courseId,
    course: rawCourse
      ? normalizeCourse(rawCourse)
      : (undefined as unknown as Course),
    instructor: (raw["instructor"] as Section["instructor"]) || undefined,
    schedule,
    maxCapacity: getNumber(raw, "maxCapacity", 0),
    currentEnrollment: getNumber(raw, "currentEnrollment", 0),
    semesterId: getString(raw, "semester") || getString(raw, "semesterId", ""),
    status: (getString(raw, "status", "Open") as Section["status"]) || "Open",
    department: getString(raw, "department", ""),
    dateCreated:
      getString(raw, "createdAt") ||
      getString(raw, "dateCreated") ||
      new Date().toISOString(),
    dateUpdated:
      getString(raw, "updatedAt") ||
      getString(raw, "dateUpdated") ||
      new Date().toISOString(),
  };
}

// Course API Services
export const courseService = {
  // Get all courses
  getAllCourses: async (): Promise<Course[]> => {
    try {
      const response = await axiosInstance.get("/courses/getAllCourses");
      const payload: unknown = (response as { data: unknown }).data;
      const dataMaybe = asRaw(payload)?.data;
      const listUnknown: unknown = Array.isArray(dataMaybe)
        ? dataMaybe
        : Array.isArray(payload)
        ? payload
        : [];
      const list = Array.isArray(listUnknown) ? (listUnknown as unknown[]) : [];
      return list.map((item) => normalizeCourse(item));
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (id: string): Promise<Course> => {
    try {
      const response = await axiosInstance.get(`/courses/getCourseById/${id}`);
      const payload: unknown = (response as { data: unknown }).data;
      const raw = (asRaw(payload)?.data as unknown) ?? payload;
      return normalizeCourse(raw);
    } catch (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
  },

  // Create new course
  createCourse: async (courseData: CreateCourseForm): Promise<Course> => {
    try {
      const response = await axiosInstance.post(
        "/courses/createCourse",
        courseData
      );
      const payload: unknown = (response as { data: unknown }).data;
      const raw = (asRaw(payload)?.data as unknown) ?? payload;
      return normalizeCourse(raw);
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  },

  // Update course
  updateCourse: async (
    id: string,
    courseData: Partial<CreateCourseForm>
  ): Promise<Course> => {
    try {
      const response = await axiosInstance.put(
        `/courses/updateCourse/${id}`,
        courseData
      );
      const payload: unknown = (response as { data: unknown }).data;
      const raw = (asRaw(payload)?.data as unknown) ?? payload;
      return normalizeCourse(raw);
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/courses/deleteCourse/${id}`);
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  },
};

// Enrollment Management API Services (using courses database)
export const enrollmentManagementService = {
  // Create new student enrollment (stored in courses database)
  createStudentEnrollment: async (
    enrollmentData: CreateStudentEnrollmentForm
  ): Promise<StudentEnrollment> => {
    try {
      // Calculate total units from selected courses
      const totalUnits = enrollmentData.selectedCourses.reduce(
        (total, courseString) => {
          const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
          return total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0);
        },
        0
      );

      // Create a course-like payload structure for enrollment data
      const payload = {
        courseCode: `ENR-${Date.now()}`, // Unique enrollment ID
        courseName: `Enrollment: ${enrollmentData.firstName} ${enrollmentData.lastName}`,
        description: `Student enrollment record for ${enrollmentData.firstName} ${enrollmentData.lastName}`,
        units: totalUnits,
        department: enrollmentData.department,
        prerequisites: [],
        maxCapacity: 1,
        day: "Monday", // Default values for required course fields
        timeStart: "08:00 AM",
        timeEnd: "09:00 AM",
        room: "N/A",
        instructor: "N/A",
        semester: enrollmentData.semester,

        // Enrollment-specific data stored as additional fields
        enrollmentType: "student_enrollment",
        studentName: enrollmentData.firstName,
        studentNumber: enrollmentData.studentNumber,
        studentDepartment: enrollmentData.department,
        studentYearLevel: enrollmentData.yearLevel,
        academicYear: enrollmentData.academicYear,
        selectedCourses: enrollmentData.selectedCourses,
        totalUnits,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Creating student enrollment with payload:", payload);

      const response = await axiosInstance.post(
        "/enroll/createEnrollment",
        payload
      );
      const resp: unknown = (response as { data: unknown }).data;
      const raw = (asRaw(resp)?.data as unknown) ?? resp;

      // Normalize the response to StudentEnrollment format
      const rawData = asRaw(raw) ?? {};
      const enrollment: StudentEnrollment = {
        id: getString(rawData, "id") || getString(rawData, "_id"),
        firstName: getString(rawData, "firstName") || getString(rawData, "studentName") || getString(rawData, "name") || "",
        lastName: getString(rawData, "lastName") || "",
        middleName: getString(rawData, "middleName"),
        email: getString(rawData, "email") || getString(rawData, "studentEmail") || "",
        courseCode: getString(rawData, "courseCode") || "",
        courseName: getString(rawData, "courseName") || "",
        studentNumber: getString(rawData, "studentNumber") || undefined,
        department:
          getString(rawData, "studentDepartment") ||
          getString(rawData, "department"),
        yearLevel: getString(
          rawData,
          "studentYearLevel"
        ) as StudentEnrollment["yearLevel"],
        semester: getString(rawData, "semester"),
        academicYear: getString(rawData, "academicYear"),
        selectedCourses: getStringArray(rawData, "selectedCourses"),
        totalUnits:
          getNumber(rawData, "totalUnits") || getNumber(rawData, "units"),
        // Add missing StudentEnrollment interface fields with default values
        instructor: getString(rawData, "instructor") || "",
        day: getString(rawData, "day") || "",
        timeStart: getString(rawData, "timeStart") || "",
        timeEnd: getString(rawData, "timeEnd") || "",
        room: getString(rawData, "room") || "",
        units: getNumber(rawData, "units") || 0,
        schedule: [],
        createdAt: getString(rawData, "createdAt") || new Date().toISOString(),
      };

      return enrollment;
    } catch (error) {
      console.error("Error creating student enrollment:", error);
      throw error;
    }
  },

  // Get all student enrollments (from courses database)
  getAllStudentEnrollments: async (): Promise<StudentEnrollment[]> => {
    try {
      const response = await axiosInstance.get("/courses/getAllCourses");
      const payload: unknown = (response as { data: unknown }).data;
      const dataMaybe = asRaw(payload)?.data;
      const listUnknown: unknown = Array.isArray(dataMaybe)
        ? dataMaybe
        : Array.isArray(payload)
        ? payload
        : [];
      const list = Array.isArray(listUnknown) ? (listUnknown as unknown[]) : [];

      // Debug: Log all items to see what we're working with
      console.log("All courses from database:", list);
      console.log(
        'Looking for items with enrollmentType === "student_enrollment"'
      );

      // Filter only enrollment records and normalize them
      const enrollments = list
        .filter((item: unknown) => {
          const raw = asRaw(item);
          // Check for enrollment records - be more flexible with filtering
          const hasEnrollmentType =
            raw && raw.enrollmentType === "student_enrollment";
          const hasStudentName = raw && raw.studentName;
          const hasEnrollmentPattern =
            raw &&
            raw.courseCode &&
            getString(raw, "courseCode").startsWith("ENR-");
          const isEnrollmentRecord =
            hasEnrollmentType || hasStudentName || hasEnrollmentPattern;

          if (isEnrollmentRecord) {
            console.log("Found enrollment record:", raw);
          }
          return isEnrollmentRecord;
        })
        .map((item: unknown): StudentEnrollment => {
          const raw = asRaw(item) ?? {};

          // Extract student name from various possible fields
          let studentName = getString(raw, "studentName");
          if (!studentName && getString(raw, "courseName")) {
            // Extract name from courseName like "Enrollment: John Doe"
            const courseNameMatch = getString(raw, "courseName").match(
              /Enrollment:\s*(.+)/
            );
            studentName = courseNameMatch
              ? courseNameMatch[1]
              : getString(raw, "courseName");
          }
          if (!studentName) {
            studentName = getString(raw, "name");
          }

          const enrollment = {
            id: getString(raw, "id") || getString(raw, "_id"),
            firstName: getString(raw, "firstName") || getString(raw, "studentName") || getString(raw, "name") || "",
            lastName: getString(raw, "lastName") || "",
            middleName: getString(raw, "middleName"),
            email: getString(raw, "email") || getString(raw, "studentEmail") || "",
            courseCode: getString(raw, "courseCode") || "",
            courseName: getString(raw, "courseName") || "",
            studentNumber: getString(raw, "studentNumber") || undefined,
            department:
              getString(raw, "studentDepartment") ||
              getString(raw, "department") ||
              "Unknown Department",
            yearLevel: (getString(raw, "studentYearLevel") ||
              "1st Year") as StudentEnrollment["yearLevel"],
            semester: getString(raw, "semester") || "Unknown Semester",
            academicYear:
              getString(raw, "academicYear") || "Unknown Academic Year",
            selectedCourses: getStringArray(raw, "selectedCourses") || [],
            totalUnits:
              getNumber(raw, "totalUnits") || getNumber(raw, "units") || 0,
            // Add missing StudentEnrollment interface fields with default values
            instructor: getString(raw, "instructor") || "",
            day: getString(raw, "day") || "",
            timeStart: getString(raw, "timeStart") || "",
            timeEnd: getString(raw, "timeEnd") || "",
            room: getString(raw, "room") || "",
            units: getNumber(raw, "units") || 0,
            schedule: [],
            createdAt:
              getString(raw, "createdAt") ||
              getString(raw, "dateCreated") ||
              new Date().toISOString(),
          };
          console.log("Normalized enrollment:", enrollment);
          return enrollment;
        });

      console.log("Final student enrollments:", enrollments);
      return enrollments;
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      throw error;
    }
  },

  // Update student enrollment (in courses database)
  updateStudentEnrollment: async (
    id: string,
    updateData: UpdateStudentEnrollmentForm & {
      totalUnits?: number;
      updatedAt?: string;
      units?: number;
    }
  ): Promise<StudentEnrollment> => {
    try {
      let payload = { ...updateData };

      // Recalculate total units if courses are updated
      if (updateData.selectedCourses) {
        const totalUnits = updateData.selectedCourses.reduce(
          (total, courseString) => {
            const unitsMatch = courseString.match(/\((\d+)\s+units?\)/);
            return total + (unitsMatch ? parseInt(unitsMatch[1], 10) : 0);
          },
          0
        );

        // Update both course units and enrollment totalUnits for consistency
        payload = {
          ...payload,
          totalUnits,
          units: totalUnits, // Update course units field as well
        };
      }

      payload = {
        ...payload,
        updatedAt: new Date().toISOString(),
      };

      console.log("Updating student enrollment with payload:", payload);

      const response = await axiosInstance.put(
        `/courses/updateCourse/${id}`,
        payload
      );
      const resp: unknown = (response as { data: unknown }).data;
      const raw = (asRaw(resp)?.data as unknown) ?? resp;

      // Normalize the response to StudentEnrollment format
      const rawData = asRaw(raw) ?? {};
      const enrollment: StudentEnrollment = {
        id: getString(rawData, "id") || getString(rawData, "_id"),
        firstName: getString(rawData, "firstName") || getString(rawData, "studentName") || getString(rawData, "name") || "",
        lastName: getString(rawData, "lastName") || "",
        middleName: getString(rawData, "middleName"),
        email: getString(rawData, "email") || getString(rawData, "studentEmail") || "",
        courseCode: getString(rawData, "courseCode") || "",
        courseName: getString(rawData, "courseName") || "",
        studentNumber: getString(rawData, "studentNumber") || undefined,
        department:
          getString(rawData, "studentDepartment") ||
          getString(rawData, "department"),
        yearLevel: getString(
          rawData,
          "studentYearLevel"
        ) as StudentEnrollment["yearLevel"],
        semester: getString(rawData, "semester"),
        academicYear: getString(rawData, "academicYear"),
        selectedCourses: getStringArray(rawData, "selectedCourses"),
        totalUnits:
          getNumber(rawData, "totalUnits") || getNumber(rawData, "units"),
        // Add missing StudentEnrollment interface fields with default values
        instructor: getString(rawData, "instructor") || "",
        day: getString(rawData, "day") || "",
        timeStart: getString(rawData, "timeStart") || "",
        timeEnd: getString(rawData, "timeEnd") || "",
        room: getString(rawData, "room") || "",
        units: getNumber(rawData, "units") || 0,
        schedule: [],
        createdAt:
          getString(rawData, "createdAt") ||
          getString(rawData, "dateCreated") ||
          new Date().toISOString(),
      };

      return enrollment;
    } catch (error) {
      console.error("Error updating student enrollment:", error);
      throw error;
    }
  },

  // Delete student enrollment (from courses database)
  deleteStudentEnrollment: async (id: string): Promise<void> => {
    try {
      console.log("Deleting student enrollment with ID:", id);
      await axiosInstance.delete(`/courses/deleteCourse/${id}`);
    } catch (error) {
      console.error("Error deleting student enrollment:", error);
      throw error;
    }
  },

  // Get student enrollment by ID
  getStudentEnrollmentById: async (id: string): Promise<StudentEnrollment> => {
    try {
      const response = await axiosInstance.get(`/courses/getAllCourses`);
      const payload: unknown = (response as { data: unknown }).data;
      const dataMaybe = asRaw(payload)?.data;
      const listUnknown: unknown = Array.isArray(dataMaybe)
        ? dataMaybe
        : Array.isArray(payload)
        ? payload
        : [];
      const list = Array.isArray(listUnknown) ? (listUnknown as unknown[]) : [];

      // Find the specific enrollment
      const enrollmentData = list.find((item: unknown) => {
        const raw = asRaw(item);
        return (
          raw && (getString(raw, "id") === id || getString(raw, "_id") === id)
        );
      });

      if (!enrollmentData) {
        throw new Error(`Student enrollment with ID ${id} not found`);
      }

      // Normalize the response to StudentEnrollment format
      const raw = asRaw(enrollmentData) ?? {};
      const enrollment: StudentEnrollment = {
        id: getString(raw, "id") || getString(raw, "_id"),
        firstName: getString(raw, "firstName") || getString(raw, "studentName") || getString(raw, "name") || "",
        lastName: getString(raw, "lastName") || "",
        middleName: getString(raw, "middleName"),
        email: getString(raw, "email") || getString(raw, "studentEmail") || "",
        courseCode: getString(raw, "courseCode") || "",
        courseName: getString(raw, "courseName") || "",
        studentNumber: getString(raw, "studentNumber") || undefined,
        department:
          getString(raw, "studentDepartment") || getString(raw, "department"),
        yearLevel: getString(
          raw,
          "studentYearLevel"
        ) as StudentEnrollment["yearLevel"],
        semester: getString(raw, "semester"),
        academicYear: getString(raw, "academicYear"),
        selectedCourses: getStringArray(raw, "selectedCourses"),
        totalUnits: getNumber(raw, "totalUnits") || getNumber(raw, "units"),
        // Add missing StudentEnrollment interface fields with default values
        instructor: getString(raw, "instructor") || "",
        day: getString(raw, "day") || "",
        timeStart: getString(raw, "timeStart") || "",
        timeEnd: getString(raw, "timeEnd") || "",
        room: getString(raw, "room") || "",
        units: getNumber(raw, "units") || 0,
        schedule: [],
        createdAt:
          getString(raw, "createdAt") ||
          getString(raw, "dateCreated") ||
          new Date().toISOString(),
      };

      return enrollment;
    } catch (error) {
      console.error("Error fetching student enrollment by ID:", error);
      throw error;
    }
  },
};

// Section API Services
export const sectionService = {
  // Get all sections
  getAllSections: async (): Promise<Section[]> => {
    try {
      const response = await axiosInstance.get("/sections/getAllSections");
      const payload: unknown = (response as { data: unknown }).data;
      const dataMaybe = asRaw(payload)?.data;
      const listUnknown: unknown = Array.isArray(dataMaybe)
        ? dataMaybe
        : Array.isArray(payload)
        ? payload
        : [];
      const list = Array.isArray(listUnknown) ? (listUnknown as unknown[]) : [];
      return list.map((item) => normalizeSection(item));
    } catch (error) {
      console.error("Error fetching sections:", error);
      throw error;
    }
  },

  // Get section by ID
  getSectionById: async (id: string): Promise<Section> => {
    try {
      const response = await axiosInstance.get(
        `/sections/getSectionById/${id}`
      );
      const payload: unknown = (response as { data: unknown }).data;
      const raw = (asRaw(payload)?.data as unknown) ?? payload;
      return normalizeSection(raw);
    } catch (error) {
      console.error("Error fetching section:", error);
      throw error;
    }
  },

  // Create new section
  createSection: async (
    sectionData: CreateSectionForm & {
      instructor?: string;
      semester?: string;
      department?: string;
    }
  ): Promise<Section> => {
    try {
      const first =
        (sectionData.schedule && sectionData.schedule[0]) || undefined;
      const body = {
        ...sectionData,
        day: first?.day,
        timeStart: first?.startTime,
        timeEnd: first?.endTime,
        room: first?.room,
      } as Record<string, unknown>;

      Object.keys(body).forEach((k) => {
        const v = (body as Record<string, unknown>)[k];
        if (v === undefined || v === null || v === "") {
          delete (body as Record<string, unknown>)[k];
        }
      });

      const response = await axiosInstance.post(
        "/sections/createSection",
        body
      );
      const resp: unknown = (response as { data: unknown }).data;
      const raw = (asRaw(resp)?.data as unknown) ?? resp;
      return normalizeSection(raw);
    } catch (error) {
      console.error("Error creating section:", error);
      throw error;
    }
  },

  // Update section
  updateSection: async (
    id: string,
    sectionData: Partial<
      CreateSectionForm & {
        instructor?: string;
        semester?: string;
        department?: string;
      }
    >
  ): Promise<Section> => {
    try {
      const first =
        (sectionData.schedule && sectionData.schedule[0]) || undefined;
      const body = {
        ...sectionData,
        day: first?.day,
        timeStart: first?.startTime,
        timeEnd: first?.endTime,
        room: first?.room,
      } as Record<string, unknown>;

      Object.keys(body).forEach((k) => {
        const v = (body as Record<string, unknown>)[k];
        if (v === undefined || v === null || v === "") {
          delete (body as Record<string, unknown>)[k];
        }
      });

      const response = await axiosInstance.put(
        `/sections/updateSection/${id}`,
        body
      );
      const resp: unknown = (response as { data: unknown }).data;
      const raw = (asRaw(resp)?.data as unknown) ?? resp;
      return normalizeSection(raw);
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  },

  // Delete section
  deleteSection: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/sections/deleteSection/${id}`);
    } catch (error) {
      console.error("Error deleting section:", error);
      throw error;
    }
  },
};
