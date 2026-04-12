import { Form, Typography } from "antd";
import { toast } from "react-toastify";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import ManuProcessStepList from "../../components/manuProcess/ManuProcessStepList";
import Button from "../../components/ui/button/Button";
import type { ManuProcess } from "../../types/manuProcess.type";

const { Title, Text } = Typography;

export default function ManufacturingProcessPage() {
  const [form] = Form.useForm<ManuProcess>();

  const handleSave = async (values: ManuProcess) => {
    try {
      console.log("values: ", values);
      toast.success("Đã lưu quy trình sản xuất.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu quy trình sản xuất.");
    }
  };

  return (
    <div className="space-y-4">
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item>
          <div className="flex items-start justify-between pb-1!">
            <div>
              <Title level={4} className="mb-1!">
                Quản lý quy trình sản xuất
              </Title>
              <Text type="secondary" className="text-sm">
                Quản lý phần giới thiệu quy trình và danh sách các bước sản xuất.
              </Text>
            </div>
            <div className="space-x-2">
              <Button type="submit" loading={false}>
                Lưu
              </Button>
            </div>
          </div>
        </Form.Item>

        {/* Title & Intro */}
        <Form.Item
          label="Tiêu đề quy trình"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề quy trình" }]}
        >
          <Input placeholder="Nhập tiêu đề quy trình" />
        </Form.Item>

        <Form.Item
          label="Mô tả tổng quan"
          name="intro"
          rules={[{ required: true, message: "Vui lòng nhập mô tả tổng quan" }]}
        >
          <TextArea rows={4} placeholder="Nhập mô tả tổng quan" />
        </Form.Item>

        {/* Steps */}
        <section className="space-y-3">
          <div className="flex items-start justify-between pb-1!">
            <div>
              <Title level={4} className="mb-1!">
                Các bước trong quy trình sản xuất
              </Title>
              <Text type="secondary" className="text-sm">
                Kéo thả để sắp xếp lại thứ tự các bước. Nhấn ✏️ để chỉnh sửa, 🗑️ để xóa bước.
              </Text>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => {}}>
                Thêm bước
              </Button>
            </div>
          </div>

          <ManuProcessStepList />

          {/* <Form.List name="steps">
            {(fields, { add, remove }) => (
              <>
                

                {fields.length === 0 ? (
                  <p className="italic text-sm text-gray-400">
                    Chưa có bước nào trong quy trình sản xuất.
                  </p>
                ) : (
                  fields.map((field, idx) => (
                    <div
                      key={field.key}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                          Bước {idx + 1}
                        </p>
                        <Button size="sm" variant="outline" onClick={() => remove(field.name)}>
                          Xóa
                        </Button>
                      </div>

                      <Form.Item
                        label="Tiêu đề"
                        name={[field.name, "title"]}
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề bước" }]}
                      >
                        <Input placeholder="Nhập tiêu đề bước" />
                      </Form.Item>

                      <Form.Item
                        label="Nội dung"
                        name={[field.name, "content"]}
                        rules={[{ required: true, message: "Vui lòng nhập nội dung bước" }]}
                      >
                        <TextArea rows={3} placeholder="Nhập mô tả bước" />
                      </Form.Item>

                      <Form.Item label="Ảnh" name={[field.name, "imgUrl"]}>
                        <UploadImageBox maxSizeMB={2} />
                      </Form.Item>
                    </div>
                  ))
                )}
              </>
            )}
          </Form.List> */}
        </section>
      </Form>
    </div>
  );
}
