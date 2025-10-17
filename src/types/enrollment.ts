// Enrollment System Types

export interface Student {
  id: string;
  studentNumber: string;
  schoolId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string | null;
  gender: "Male" | "Female" | "UNSPECIFIED";
  address: string;
  department: string;
  yearLevel: "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | "5th Year";
  program?: string;
  status?: "Active" | "Inactive" | "Graduated" | "Dropped";
  dateCreated: string;
  dateUpdated: string;
}

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  description?: string;
  units: number;
  department: string;
  prerequisites?: string[];
  dateCreated: string;
  dateUpdated: string;
}

export interface Section {
  id: string;
  sectionCode: string;
  sectionName: string;
  courseId: string;
  course: Course;
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  schedule: {
    day:
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday";
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  maxCapacity: number;
  currentEnrollment: number;
  department: string;
  semesterId: string;
  status: "Open" | "Closed" | "Cancelled";
  dateCreated: string;
  dateUpdated: string;
}

export interface Semester {
  id: string;
  semesterName: string;
  academicYear: string;
  semesterType: "FIRST" | "SECOND" | "SUMMER";
  semesterDuration: string;
  enrollmentPeriod: string;
  startDate?: string;
  endDate?: string;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  status:
    | "active"
    | "inactive"
    | "completed"
    | "Active"
    | "Inactive"
    | "Completed";
  dateCreated: string;
  dateUpdated: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  student: Student;
  sectionId: string;
  section: Section;
  semesterId: string;
  semester: Semester;
  enrollmentDate: string;
  status: "Enrolled" | "Dropped" | "Withdrawn" | "Completed";
  grade?: string;
  remarks?: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface EnrollmentRecord {
  id: string;
  studentId: string;
  student: Student;
  semesterId: string;
  semester: Semester;
  totalUnits: number;
  enrolledSections: {
    section: Section;
    enrollment: Enrollment;
  }[];
  status: "Enrolled" | "Dropped" | "Withdrawn" | "Completed";
  enrollmentDate: string;
  lastUpdated: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Form Types
export interface CreateStudentForm {
  studentNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  address: string;
  department: string;
  yearLevel: "1st Year" | "2nd Year" | "3rd Year" | "4th Year" | "5th Year";
  program?: string;
  status?: "Active" | "Inactive" | "Graduated" | "Dropped";
}

export interface CreateCourseForm {
  courseCode: string;
  courseName: string;
  description?: string;
  units: number;
  department: string;
  prerequisites?: string[];
}

export interface CreateSectionForm {
  sectionCode: string;
  sectionName: string;
  courseId: string;
  instructorId?: string;
  schedule: {
    day:
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday";
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  maxCapacity: number;
  department: string;
  semesterId: string;
}

export interface CreateSemesterForm {
  semesterName: string;
  academicYear: string;
  semesterType: "FIRST" | "SECOND" | "SUMMER";
  semesterDuration: string;
  enrollmentPeriod: string;
}

export interface EnrollStudentForm {
  studentId: string;
  sectionIds: string[];
  semesterId: string;
}

// Filter and Search Types
export interface StudentFilters {
  department?: string;
  yearLevel?: string;
  status?: string;
  search?: string;
}

export interface CourseFilters {
  department?: string;
  status?: string;
  search?: string;
}

export interface SectionFilters {
  semesterId?: string;
  courseId?: string;
  status?: string;
  search?: string;
}

export interface EnrollmentFilters {
  semesterId?: string;
  studentId?: string;
  status?: string;
  search?: string;
}

// Statistics Types
export interface EnrollmentStats {
  totalStudents: number;
  totalCourses: number;
  totalSections: number;
  activeEnrollments: number;
  enrollmentByDepartment: {
    department: string;
    count: number;
  }[];
  enrollmentByYearLevel: {
    yearLevel: string;
    count: number;
  }[];
  semesterStats: {
    semester: string;
    totalEnrollments: number;
    completedEnrollments: number;
  }[];
}
