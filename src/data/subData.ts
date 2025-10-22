import { clearingOfficerService } from "../api/co";
import type { ClearingOfficer } from "../api/co";

export const departments = [
  "Bachelor of Science in Hospitality Management",
  "Civil Engineering and Computer Science",
  "Bachelor of Science in Electrical Engineering",
  "Bachelor of Science in Criminology",
  "Bachelor of Science in Social Work",
  "Bachelor of Science in Accountancy",
  "Bachelor of Science in Midwifery",
  "Bachelor of Science in Medical Technology",
  "Bachelor of Science in Nursing",
  "Bachelor of Science in Business Administration",
  "Bachelor of Elementary Education",
  "Bachelor of Arts in Political Science",
  "Bachelor in Secondary Education Major in Mathematics",
  "Bachelor in Secondary Education Major in Science",
  "Bachelor in Secondary Education Major in Filipino",
  "All Departments",
];

export const yearLevels = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Old Student",
];

export const programs = [
  "BSHM",
  "BSCS",
  "BSEE",
  "BSCRIM",
  "BSSW",
  "BSA",
  "BSM",
  "BSMT",
  "BSN",
  "BSBA",
  "BEEd",
  "AB PolSci",
  "BSEd-Math",
  "BSEd-Sci",
  "BSEd-Fil",
];

export const semesters = [
  {
    id: "1",
    semesterName: "1st Semester",
  },
  {
    id: "2",
    semesterName: "2nd Semester",
  },
  {
    id: "3",
    semesterName: "Summer",
  },
];

// Interface for instructor data structure
export interface Instructor {
  id: string;
  name: string;
}

// Function to get clearing officers as instructors
export const getClearingOfficersAsInstructors = async (): Promise<
  Instructor[]
> => {
  try {
    const officers = await clearingOfficerService.getAllClearingOfficers();
    return officers.map((officer: ClearingOfficer, index: number) => ({
      id: (index + 1).toString(),
      name: `${officer.firstName} ${officer.lastName}`,
    }));
  } catch (error) {
    console.error("Error fetching clearing officers:", error);
    // Return empty array or fallback data if API fails
    return [];
  }
};

// Fallback static instructors (kept for backward compatibility)
export const instructors = [
  {
    id: "1",
    name: "John Doe",
  },
  {
    id: "2",
    name: "Jane Doe",
  },
  {
    id: "3",
    name: "John Smith",
  },
  {
    id: "4",
    name: "Jane Smith",
  },
  {
    id: "5",
    name: "John Doe",
  },
  {
    id: "6",
    name: "Jane Doe",
  },
];
