// src/routes/index.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import EnrollmentLogin from "../pages/enrollmentSide/EnrollmentLogin";
import Unauthorized from "../components/Unauthorized";
import EnrollmentLayout from "../layouts/EnrollmentLayout";
import EnrollmentDashboard from "../pages/enrollmentSide/EnrollmentDashboard";
import StudentManagement from "../pages/enrollmentSide/StudentManagement";
import CourseManagement from "../pages/enrollmentSide/CourseManagement";
import SemesterManagement from "../pages/enrollmentSide/SemesterManagement";
import StudentEnrollment from "../pages/enrollmentSide/StudentEnrollment";
import EnrollmentRecords from "../pages/enrollmentSide/EnrollmentRecords";
import CoManagement from "@/pages/enrollmentSide/CoManagement";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Enrollment System Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <EnrollmentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EnrollmentDashboard />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="co" element={<CoManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="semester" element={<SemesterManagement />} />
        <Route path="enroll" element={<StudentEnrollment />} />
        <Route path="records" element={<EnrollmentRecords />} />
      </Route>
      <Route
        path="enrollmentLogin"
        element={
          <PublicRoute>
            <EnrollmentLogin />
          </PublicRoute>
        }
      />
      <Route
        path="login"
        element={
          <PublicRoute>
            <EnrollmentLogin />
          </PublicRoute>
        }
      />

      <Route path="unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};

export default AppRoutes;
