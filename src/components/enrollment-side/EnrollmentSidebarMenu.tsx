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
        "h-screen bg-[#1A1730] transition-all duration-300 ease-in-out flex flex-col"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-gray-200 mt-3">
        <div className="flex h-20 items-center justify-between px-4  backdrop-blur-sm">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="relative">
              <img className="h-8 w-11" src="/10.png" alt="Menu icon" />
              {/* <div className="absolute -top-1 -right-1 h-4 w-4 bg-violet-500 rounded-full border-2 border-slate-800 animate-pulse"></div> */}
            </div>

            <div>
              <span className="font-bold text-md bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
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
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-200 hover:bg-gray-800 hover:text-white"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 opacity-90 rounded-lg z-0" />
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
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-4 shadow-2xl backdrop-blur-xl">

          {/* Glow Effect */}
          <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-cyan-500/20 blur-3xl" />

          {/* Content */}
          <div className="relative z-10">
            {/* User */}
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40"
                alt="Admin"
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-indigo-500/40"
              />

              <div className="flex-1 overflow-hidden">
                <h3 className="truncate text-sm font-semibold text-white">
                  Administrator
                </h3>

                <p className="truncate text-xs text-zinc-400">
                  System Administrator
                </p>
              </div>

              {/* Online Status */}
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-white/10" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3 backdrop-blur-md">
                <p className="text-xs text-zinc-400">Users</p>
                <h4 className="mt-1 text-lg font-bold text-white">12.4K</h4>
              </div>

              <div className="rounded-xl bg-white/5 p-3 backdrop-blur-md">
                <p className="text-xs text-zinc-400">Revenue</p>
                <h4 className="mt-1 text-lg font-bold text-white">$8.2K</h4>
              </div>
            </div>

            {/* Footer Actions */}
            {/* <div className="mt-4 flex items-center gap-2">
              <button className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30">
                Dashboard
              </button>

              <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition-all duration-300 hover:bg-white/10 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7"
                  />
                </svg>
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </aside>
  );
}
