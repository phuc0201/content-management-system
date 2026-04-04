import { Form, Input, Typography } from "antd";
const { Title, Text } = Typography;

interface WebsiteInformationProps {}

const WebsiteInformation: React.FC<WebsiteInformationProps> = () => {
  return (
    <div>
      <div className="mb-6">
        <Title level={4} className="mb-1!">
          Thông tin website
        </Title>
        <Text type="secondary" className="text-sm">
          Cập nhật thông tin cơ bản của website.
        </Text>
      </div>
      <Form.Item>
        <Input></Input>
      </Form.Item>
    </div>
  );
};

export default WebsiteInformation;
