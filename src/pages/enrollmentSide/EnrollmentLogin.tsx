import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BookOpen, GraduationCap } from "lucide-react";
import { useAuth } from "../../authentication/useAuth";
import { loginSchema, type LoginData } from "../../lib/validation";
import FormInput from "../../components/myUi/auth/FormInput";
import AuthButton from "../../components/myUi/auth/AuthButton";
import StatusModal from "../../components/myUi/auth/StatusModal";

export default function EnrollmentLogin() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const { login, role, user, isAuthenticated } = useAuth();

  // Redirect based on role if already authenticated
  useEffect(() => {
    if (!isAuthenticated || !role) return;

    if (role === "admin") {
      // Admin can access enrollment system
      setIsSuccessModalVisible(true);
      return;
    } else if (role === "enrollmentOfficer") {
      // Enrollment officer can access enrollment system
      setIsSuccessModalVisible(true);
      return;
    } else {
      // Other roles should not access enrollment system
      setError(
        "Access denied. Only administrators and enrollment officers can access this system."
      );
    }
  }, [isAuthenticated, role]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError("");

    try {
      await login(data.email, data.password);
      setIsSuccessModalVisible(true);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { error?: string } };
        request?: unknown;
      };
      if (axiosError.response) {
        const { status } = axiosError.response;

        if (status === 401 || status === 404 || status === 400) {
          setError(
            axiosError.response.data?.error ||
              "Wrong credentials. Please try again."
          );
        }
      } else if (axiosError.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalOk = () => {
    setIsSuccessModalVisible(false);
    // Redirect to enrollment dashboard after successful login
    navigate("/enrollment");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side: Image and branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="text-center text-white p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-6">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">Enrollment Management</h1>
          <p className="text-xl text-blue-100 mb-8">
            Streamline student enrollment with our comprehensive management
            system
          </p>

          <div className="grid grid-cols-2 gap-6 text-left">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <BookOpen className="h-5 w-5" />
              </div>
              <span>Course Management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span>Student Records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex flex-col justify-center flex-1 px-6 py-12 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {/* Logo and branding */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <img
                className="h-12 w-12 rounded-md object-cover"
                src="/MICRO FLUX LOGO.png"
                alt="Enrollment System Logo"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Enrollment System
                </h2>
                <p className="text-sm text-gray-500">NCMC Clearance Portal</p>
              </div>
            </div>
          </div>

          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-700 mb-2">
            Welcome back!
          </h2>
          <p className="text-center text-sm text-gray-600">
            Access the enrollment management system
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3"
            noValidate
          >
            <FormInput
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@ncmc.edu.ph"
              register={register}
              label="Email address"
              error={errors.email}
            />

            <FormInput
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              register={register}
              label="Password"
              error={errors.password}
            />

            <div className="text-sm my-5 flex justify-end">
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <AuthButton
              isLoading={isLoading}
              label="Sign in to Enrollment"
              type="submit"
            />
          </form>

          <div className="text-center text-xs sm:text-sm text-gray-600 mt-5">
            Need access?{" "}
            <Link
              to="https://ncmcmaranding.com/contact-us"
              target="_blank"
              className="text-indigo-600 hover:underline hover:text-indigo-500 transition"
            >
              Contact system administrator
            </Link>
          </div>

          <div className="text-center text-xs sm:text-sm text-gray-600 mt-3">
            Back to{" "}
            <Link
              to="/"
              className="text-indigo-600 hover:underline hover:text-indigo-500 transition"
            >
              main portal
            </Link>
          </div>
        </div>
      </div>

      <StatusModal
        isOpen={isSuccessModalVisible}
        onOk={handleSuccessModalOk}
        role={role || ""}
        successTitle="Login Successful"
        successMessage={`Welcome back, ${user?.firstName}! Accessing Enrollment Management System...`}
        errorTitle="Access Denied"
        errorMessage={
          error ||
          "You don't have permission to access the enrollment system. Please contact your administrator."
        }
      />
    </div>
  );
}
