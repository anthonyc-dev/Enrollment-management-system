import React from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Avatar, type MenuProps, message } from "antd";
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
      <div className="cursor-pointer flex items-center gap-2">
        <Avatar size="large" icon={<UserOutlined />} />
        <span className="text-gray-300">Enrollment Officer</span>
      </div>
    </Dropdown>
  );
};

export default UserDropdown;
