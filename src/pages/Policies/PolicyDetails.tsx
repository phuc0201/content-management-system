import { Form, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import RichTextEditor from "../../components/common/RichTextEditor";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { PATH } from "../../constants/path.constant";
import type { Policy } from "../../types/policy.type";
const { Title, Text } = Typography;

export default function PolicyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = !id;

  const handleSave = (values: Policy) => {
    try {
      console.log("values: ", values);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSave}>
      <div className="flex items-center justify-between pb-4!">
        <div>
          <Title level={4} className="mb-1!">
            {isCreateMode ? "Tạo chính sách" : "Chi tiết chính sách"}
          </Title>
          <Text type="secondary" className="text-sm">
            Cập nhật thông tin, mô tả và ảnh chính sách.
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(PATH.POLICY)}>
            Quay lại
          </Button>
          <Button type="submit" variant="primary" loading={false}>
            Lưu chính sách
          </Button>
        </div>
      </div>

      <Form.Item
        label="Tiêu đề"
        name="title"
        required
        rules={[{ required: true, message: "Vui lòng nhập tiêu đề chính sách" }]}
      >
        <Input placeholder="Nhập tiêu đề chính sách" />
      </Form.Item>
      <Form.Item
        label="Nội dung"
        name="content"
        required
        rules={[{ required: true, message: "Vui lòng nhập nội dung chính sách" }]}
      >
        <RichTextEditor />
      </Form.Item>
    </Form>
  );
}
