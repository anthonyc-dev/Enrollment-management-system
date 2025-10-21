import { BellIcon, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "../../authentication/useAuth";
import NotificationDrawer from "../NotificationDrawer";

interface NavbarProps {
  toggleSidebar: () => void;
}
const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { logout } = useAuth();

  const notificationCount = 3;

  // const handleLogout = () => {
  //   console.log("Logging out...");
  // };

  // const handleNotificationClick = () => {
  //   console.log("Opening notifications...");
  //   setIsNotificationOpen(true); // this was missing
  // };

  return (
    <nav className="p-5 ">
      {/* backdrop-blur-md border-b border-border/50 */}
      <div className=" bg-[#0F0E0E] backdrop-blur-md mx-auto px-4 sm:px-6 lg:px-8 rounded-lg border-1 border-white/15">
        <div className="flex items-center justify-between h-16">
          {/* Title */}
          <Button
            onClick={toggleSidebar}
            className="lg:hidden rounded-md hover:bg-gray-100 mr-2 text-green-600"
            variant="ghost"
          >
            <Menu className="h-12 w-12" />
          </Button>
          <div className="flex flex-shrink-0">
            {/* <h1 className="text-xl font-bold text-foreground">Your App</h1> */}
            {/* Search bar or other center content */}
            <div className="flex-1 flex justify-center">
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
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => setIsNotificationOpen(true)}
            >
              <BellIcon className="h-10 w-10 text-white/50" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>

            <NotificationDrawer
              open={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User size={24} className="text-white/50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
