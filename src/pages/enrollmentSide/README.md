# Enrollment Management System

## Overview

The Enrollment Management System is a comprehensive solution for managing student enrollments, courses, sections, and semesters in an educational institution. It provides a complete workflow from student management to enrollment records tracking.

## Features

### 🎯 Core Functionality

1. **Student Management**

   - Add, edit, and manage student accounts
   - Search and filter students by department, year level, status
   - Generate dummy data for testing
   - View student statistics

2. **Course Management**

   - Create and manage courses with prerequisites
   - Set up course sections with schedules and instructors
   - Track section capacity and enrollment
   - Manage course departments and units

3. **Semester Management**

   - Create academic semesters (1st Sem, 2nd Sem, Summer)
   - Set enrollment periods and semester durations
   - Manage semester status (Upcoming, Active, Completed, Cancelled)
   - View semester statistics

4. **Student Enrollment**

   - Multi-step enrollment process
   - Select student → Choose semester → Pick courses → Confirm
   - Real-time section availability checking
   - Unit calculation and validation

5. **Enrollment Records**
   - View all enrollment records with filtering
   - Update enrollment status (Enrolled, Dropped, Withdrawn, Completed)
   - Export enrollment data
   - Detailed enrollment history

## File Structure

```
src/pages/enrollmentSide/
├── EnrollmentDashboard.tsx      # Main dashboard with statistics
├── StudentManagement.tsx        # Student CRUD operations
├── CourseManagement.tsx         # Course and section management
├── SemesterManagement.tsx       # Semester creation and management
├── StudentEnrollment.tsx        # Enrollment workflow
├── EnrollmentRecords.tsx        # Records viewing and management
└── README.md                    # This documentation

src/types/
└── enrollment.ts                # TypeScript type definitions

src/data/
└── enrollmentDummyData.ts       # Dummy data templates
```

## API Templates

The system is designed with future API integration in mind. Here are the expected API endpoints:

### Students API

```typescript
// GET /api/students
// POST /api/students
// PUT /api/students/:id
// DELETE /api/students/:id

interface StudentAPI {
  getStudents(filters?: StudentFilters): Promise<PaginatedResponse<Student>>;
  createStudent(data: CreateStudentForm): Promise<ApiResponse<Student>>;
  updateStudent(
    id: string,
    data: Partial<Student>
  ): Promise<ApiResponse<Student>>;
  deleteStudent(id: string): Promise<ApiResponse<void>>;
}
```

### Courses API

```typescript
// GET /api/courses
// POST /api/courses
// PUT /api/courses/:id
// DELETE /api/courses/:id

interface CourseAPI {
  getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>>;
  createCourse(data: CreateCourseForm): Promise<ApiResponse<Course>>;
  updateCourse(id: string, data: Partial<Course>): Promise<ApiResponse<Course>>;
  deleteCourse(id: string): Promise<ApiResponse<void>>;
}
```

### Sections API

```typescript
// GET /api/sections
// POST /api/sections
// PUT /api/sections/:id
// DELETE /api/sections/:id

interface SectionAPI {
  getSections(filters?: SectionFilters): Promise<PaginatedResponse<Section>>;
  createSection(data: CreateSectionForm): Promise<ApiResponse<Section>>;
  updateSection(
    id: string,
    data: Partial<Section>
  ): Promise<ApiResponse<Section>>;
  deleteSection(id: string): Promise<ApiResponse<void>>;
}
```

### Semesters API

```typescript
// GET /api/semesters
// POST /api/semesters
// PUT /api/semesters/:id
// DELETE /api/semesters/:id

interface SemesterAPI {
  getSemesters(): Promise<ApiResponse<Semester[]>>;
  createSemester(data: CreateSemesterForm): Promise<ApiResponse<Semester>>;
  updateSemester(
    id: string,
    data: Partial<Semester>
  ): Promise<ApiResponse<Semester>>;
  deleteSemester(id: string): Promise<ApiResponse<void>>;
}
```

### Enrollments API

```typescript
// GET /api/enrollments
// POST /api/enrollments
// PUT /api/enrollments/:id
// DELETE /api/enrollments/:id

interface EnrollmentAPI {
  getEnrollments(
    filters?: EnrollmentFilters
  ): Promise<PaginatedResponse<Enrollment>>;
  enrollStudent(data: EnrollStudentForm): Promise<ApiResponse<Enrollment[]>>;
  updateEnrollment(
    id: string,
    data: Partial<Enrollment>
  ): Promise<ApiResponse<Enrollment>>;
  removeEnrollment(id: string): Promise<ApiResponse<void>>;
  getEnrollmentRecords(
    filters?: EnrollmentFilters
  ): Promise<PaginatedResponse<EnrollmentRecord>>;
}
```

## Dummy Data Structure

The system includes comprehensive dummy data that can be used for testing and development:

### Students

- 5 sample students with complete profiles
- Different departments, year levels, and statuses
- Realistic contact information and addresses

### Courses

- 5 sample courses across different departments
- Varying units and prerequisites
- Active status for immediate testing

### Sections

- 3 sample sections with different schedules
- Instructor assignments
- Capacity and enrollment tracking

### Semesters

- 3 semesters (Completed, Active, Upcoming)
- Proper date ranges and enrollment periods
- Different academic years

### Enrollments

- Sample enrollment records
- Different statuses and dates
- Realistic enrollment patterns

## Usage Workflow

### 1. Login as Admin

Access the admin dashboard at `/admin-side`

### 2. Manage Student Accounts

Navigate to `/admin-side/enrollment/students`

- Add new students
- Edit existing student information
- Generate dummy data for testing
- Filter and search students

### 3. Manage Courses and Sections

Navigate to `/admin-side/enrollment/courses`

- Create new courses with prerequisites
- Set up sections with schedules
- Assign instructors
- Manage section capacity

### 4. Create Semester

Navigate to `/admin-side/enrollment/semester`

- Create new academic semesters
- Set enrollment periods
- Manage semester status

### 5. Enroll Students

Navigate to `/admin-side/enrollment/enroll`

- Select student to enroll
- Choose semester
- Pick available courses
- Confirm enrollment

### 6. View/Update Records

Navigate to `/admin-side/enrollment/records`

- View all enrollment records
- Filter by various criteria
- Update enrollment status
- Export data

## Navigation

The enrollment system is integrated into the admin sidebar with a collapsible menu:

```
📊 Dashboard
👥 Student
👨‍💼 Clearing Officer
🎓 Enrollment
  ├── 📊 Dashboard
  ├── 👥 Students
  ├── 📚 Courses
  ├── 📅 Semesters
  ├── ➕ Enroll Student
  └── 📋 Records
⚙️ Account Settings
```

## Technical Implementation

### State Management

- Uses React hooks for local state management
- Dummy data stored in separate module for easy replacement
- Form validation using Ant Design Form component

### UI Components

- Built with Ant Design components
- Responsive design for mobile and desktop
- Consistent styling with existing admin interface

### Type Safety

- Comprehensive TypeScript interfaces
- Strict type checking for all data structures
- API response type definitions

### Future Enhancements

- Real API integration
- Bulk enrollment operations
- Advanced reporting and analytics
- Email notifications
- PDF report generation
- Role-based permissions

## Testing

The system includes:

- Dummy data generation functions
- Sample data for immediate testing
- Form validation and error handling
- Responsive design testing

## Dependencies

- React 18+
- TypeScript
- Ant Design
- React Router
- Lucide React (icons)

## Contributing

When adding new features:

1. Update TypeScript interfaces in `src/types/enrollment.ts`
2. Add dummy data templates in `src/data/enrollmentDummyData.ts`
3. Follow existing component patterns
4. Update this README with new functionality
5. Test with dummy data before API integration
