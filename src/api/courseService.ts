import axiosInstance from "./axios";
import type {
  Course,
  Section,
  CreateCourseForm,
  CreateSectionForm,
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
    createdAt:
      getString(raw, "createdAt") ||
      getString(raw, "dateCreated") ||
      new Date().toISOString(),
    updatedAt:
      getString(raw, "updatedAt") ||
      getString(raw, "dateUpdated") ||
      new Date().toISOString(),
  } as Course;
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
    semester: getString(raw, "semester") || getString(raw, "semesterId", ""),
    department: getString(raw, "department", ""),
    dateCreated:
      getString(raw, "createdAt") ||
      getString(raw, "dateCreated") ||
      new Date().toISOString(),
    dateUpdated:
      getString(raw, "updatedAt") ||
      getString(raw, "dateUpdated") ||
      new Date().toISOString(),
  } as Section;
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
