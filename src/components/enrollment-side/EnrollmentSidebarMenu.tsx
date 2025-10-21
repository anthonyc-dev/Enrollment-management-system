import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  UserPlus,
  FileText,
  UserCheck,
} from "lucide-react";
import { cn } from "../../lib/utils";

const enrollmentNavbar = [
  {
    to: "/",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    to: "/students",
    icon: Users,
    label: "Student Management",
  },
  {
    to: "/co",
    icon: UserCheck,
    label: "Officer Management",
  },
  {
    to: "/courses",
    icon: BookOpen,
    label: "Course Management",
  },
  {
    to: "/semester",
    icon: Calendar,
    label: "Semester Management",
  },
  {
    to: "/enroll",
    icon: UserPlus,
    label: "Student Enrollment",
  },
  {
    to: "/records",
    icon: FileText,
    label: "Enrollment Records",
  },
];

interface CloseSidebarProps {
  closeSidebar: () => void;
}

export function EnrollmentSideMenu({ closeSidebar }: CloseSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (
      path !== "/" &&
      (currentPath === path || currentPath.startsWith(path + "/"))
    )
      return true;
    return false;
  };

  return (
    <aside
      className={cn(
        "h-screen bg-[#0F0E0E] transition-all duration-300 ease-in-out flex flex-col"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-gray-200 mt-3">
        <div className="flex h-20 items-center justify-between px-4  backdrop-blur-sm">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="relative">
              <img
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-500/30 shadow-lg"
                src="/MICRO FLUX LOGO.png"
                alt="Menu icon"
              />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
            </div>

            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Enrollment
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Management System v2.0
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={closeSidebar}
          className={cn(
            "lg:hidden h-8 w-8 items-center justify-center rounded-md",
            "bg-gray-100 hover:bg-blue-500 hover:text-white text-gray-700",
            "transition-all duration-300 hover:scale-110 active:scale-95"
          )}
        >
          <ChevronLeft className="h-4 w-4 inline-block" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 mt-4">
        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search enrollment..."
            className="w-full rounded-lg bg-gray-50 pl-10 pr-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div> */}
      </div>

      {/* Navigation */}
      <div className="mt-6 px-2 flex-1 overflow-y-auto">
        <h4 className="text-xs font-semibold text-gray-200 uppercase mb-2">
          Enrollment System
        </h4>

        <nav className="space-y-1">
          {enrollmentNavbar.map((item, index) => {
            const active = isActive(item.to);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 group cursor-pointer",
                  active
                    ? "bg-[#118B50] text-white shadow-sm"
                    : "text-gray-200 hover:bg-gray-800 hover:text-white"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-[#118B50] opacity-90 rounded-lg z-0" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 z-10 relative",
                    active && "animate-pulse-glow"
                  )}
                />

                <span className="z-10 relative animate-fade-in flex-1">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className=" py-4">
          <h4 className="text-xs font-semibold text-gray-200 uppercase mb-2">
            Quick Actions
          </h4>
          <div className="space-y-2">
            <NavLink
              to="/enroll"
              className="flex items-center gap-2 rounded-lg text-white px-4 py-2.5 text-sm font-medium transition-all duration-300 group cursor-pointer hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4" />
              <span>Quick Enroll</span>
            </NavLink>
            <NavLink
              to="/records"
              className="flex items-center gap-2 rounded-lg text-white px-4 py-2.5 text-sm font-medium transition-all duration-300 group cursor-pointer hover:bg-gray-800"
            >
              <FileText className="h-4 w-4" />
              <span>View Records</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-4">
        <div className="rounded-lg p-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
              className="size-10 rounded-full object-cover"
            />

            <div>
              <p className="font-medium text-xs text-blue-600">
                Enrollment Officer
              </p>
              <p className="text-xs text-gray-400">enrollment@ascs.edu</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
