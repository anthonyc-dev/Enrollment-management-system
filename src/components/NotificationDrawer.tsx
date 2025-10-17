import { Drawer, List, Badge, Typography, Space, Avatar } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const NotificationDrawer = ({ open, onClose }: NotificationDrawerProps) => {
  // Mock notifications data - replace with your actual data
  const notifications = [
    {
      id: 1,
      title: "New Student Registration",
      message: "John Doe has registered for clearing",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Document Verification",
      message: "Sarah Smith's documents have been verified",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 3,
      title: "System Update",
      message: "System maintenance scheduled for tomorrow",
      time: "2 hours ago",
      read: true,
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <BellOutlined />
          <span>Notifications</span>
          <Badge count={notifications.filter((n) => !n.read).length} />
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={350}
    >
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Badge dot={!item.read}>
                  <Avatar icon={<UserOutlined />} />
                </Badge>
              }
              title={
                <Space>
                  <Text strong>{item.title}</Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {item.time}
                  </Text>
                </Space>
              }
              description={item.message}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default NotificationDrawer;
