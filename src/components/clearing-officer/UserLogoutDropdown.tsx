import React from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, type MenuProps, message } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import axiosInstance from "@/api/axios";

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();

  // 🔒 Handle logout securely
  const handleLogout = async () => {
    try {
      // 🧩 Call backend logout API to clear refresh token cookie
      await axiosInstance.post(
        "/enrollment-auth/logout",
        {},
        { withCredentials: true }
      );

      // 🔒 Remove access token locally
      localStorage.removeItem("accessToken");

      message.success("You have been logged out.");
      navigate("/enrollmentLogin");
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("Logout failed. Please try again.");
    }
  }; // ✅ Fixed: properly closed the function

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <span
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2"
        >
          <UserOutlined />
          Profile
        </span>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <span
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600"
        >
          <LogoutOutlined />
          Logout
        </span>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      placement="bottomRight"
      arrow
    >
      <div className="rounded-lg hover:bg-gray-800 p-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <img
            alt=""
            src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
            className="size-10 rounded-full object-cover"
          />

          <div>
            <p className="font-medium text-xs text-indigo-400">
              Administrator
            </p>
            <p className="text-xs text-gray-400">ncmc@gmail.com</p>
          </div>
        </div>
      </div>
    </Dropdown>
  );
};

export default UserDropdown;
