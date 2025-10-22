import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, GraduationCap } from "lucide-react";

import { loginSchema, type LoginData } from "../../lib/validation";
import FormInput from "../../components/myUi/auth/FormInput";
import AuthButton from "../../components/myUi/auth/AuthButton";
import StatusModal from "../../components/myUi/auth/StatusModal";
import axiosInstance from "@/api/axios";
import type { AxiosError } from "axios";

export default function EnrollmentLogin() {
  const navigate = useNavigate();

  // ✅ State management
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // ✅ React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  // ✅ Login handler
  const handleLogin = async (email: string, password: string) => {
    const res = await axiosInstance.post("/enrollment-auth/login", {
      email,
      password,
    });

    // Store token securely
    localStorage.setItem("accessToken", res.data.accessToken);
    return res.data;
  };

  // ✅ Form submit handler
  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError("");

    try {
      const userData = await handleLogin(data.email, data.password);
      // Show success modal
      setIsSuccessModalVisible(true);

      // Optional: Save user info
      localStorage.setItem("user", JSON.stringify(userData.user || {}));
    } catch (err: unknown) {
      // ✅ Type-safe error handling
      if (typeof err === "object" && err !== null && "isAxiosError" in err) {
        const axiosError = err as AxiosError<{ error?: string }>;

        if (axiosError.response) {
          const { status } = axiosError.response;
          if ([400, 401, 404].includes(status)) {
            setError(
              axiosError.response.data?.error ||
                "Wrong credentials. Please try again."
            );
          } else {
            setError("Server error. Please try again later.");
          }
        } else if (axiosError.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError("Unexpected error. Please try again.");
        }
      } else {
        // Non-Axios errors (e.g., runtime)
        setError("Unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // ✅ Handle success modal
  const handleSuccessModalOk = () => {
    setIsSuccessModalVisible(false);
    navigate("/"); // redirect to dashboard
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side: branding */}
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
      <div className="flex flex-col justify-center flex-1 px-6 py-12 bg-[#0F0E0E]">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <img
                className="h-12 w-12 rounded-md object-cover"
                src="/MICRO FLUX LOGO.png"
                alt="Enrollment System Logo"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-300">
                  Enrollment System
                </h2>
                <p className="text-sm text-gray-500">NCMC Clearance Portal</p>
              </div>
            </div>
          </div>

          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-300 mb-2">
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
        role=""
        successTitle="Login Successful"
        successMessage="Welcome back! Accessing Enrollment Management System..."
        errorTitle="Access Denied"
        errorMessage={
          error ||
          "You don't have permission to access the enrollment system. Please contact your administrator."
        }
      />
    </div>
  );
}
