import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { lazy, Suspense, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { PATH } from "../../constants/path.constant";
import { useGetPolicyByIdQuery, useUpdatePolicyMutation } from "../../services/policy.service";
import type { Policy } from "../../types/policy.type";
const RichTextEditor = lazy(() => import("../../components/common/RichTextEditor"));

const { Title, Text } = Typography;

export default function PolicyDetails() {
  const [form] = useForm<Policy>();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: policyData, isLoading } = useGetPolicyByIdQuery(id!, {
    skip: !id,
  });

  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();

  const handleSave = async (values: Policy) => {
    try {
      if (!id) {
        toast.error("ID chính sách không hợp lệ.");
        return;
      }
      await updatePolicy({ id: id!, body: values }).unwrap();

      toast.success("Đã lưu chính sách.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu chính sách.");
    }
  };

  useLayoutEffect(() => {
    if (policyData?.data) {
      form.setFieldsValue({
        title: policyData.data.title,
        content: policyData.data.content,
      });
    }
  }, [policyData, form]);

  return (
    <Form form={form} layout="vertical" onFinish={handleSave}>
      <div className="flex items-center justify-between pb-4!">
        <div>
          <Title level={4} className="mb-1!">
            Chi tiết chính sách
          </Title>
          <Text type="secondary" className="text-sm">
            Cập nhật thông tin, mô tả và ảnh chính sách.
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(PATH.POLICY)}>
            Quay lại
          </Button>
          <Button type="submit" variant="primary" loading={isUpdating || isLoading}>
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
        <Input placeholder="Nhập tiêu đề chính sách" disabled={isUpdating || isLoading} />
      </Form.Item>

      <Suspense fallback={<div>Đang tải nội dung...</div>}>
        <Form.Item
          label="Nội dung"
          name="content"
          required
          rules={[{ required: true, message: "Vui lòng nhập nội dung chính sách" }]}
        >
          <RichTextEditor
            type="policy"
            ownerId={id}
            imageIds={(policyData?.data?.images || []).map((i) => i?.id as string)}
          />
        </Form.Item>
      </Suspense>
    </Form>
  );
}
