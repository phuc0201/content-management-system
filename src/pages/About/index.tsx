import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import FormItem from "antd/es/form/FormItem";
import { useLayoutEffect, useMemo } from "react";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { useCreateAboutUpsertMutation, useGetAboutQuery } from "../../services/about.service";
import type { AboutContent } from "../../types/about.type";

const { Title, Text } = Typography;

export default function AboutPage() {
  const [form] = useForm();
  const { data: aboutContent, isFetching, isLoading: isGetting } = useGetAboutQuery();
  const [createAbout, { isLoading: isCreating }] = useCreateAboutUpsertMutation();

  const initialData = useMemo<AboutContent>(
    () => ({
      intro: aboutContent?.intro ?? "",
      vision: aboutContent?.vision ?? "",
      mission: aboutContent?.mission ?? "",
      core_values: aboutContent?.core_values || [],
    }),
    [aboutContent],
  );

  async function handleSave() {
    try {
      const values = await form.validateFields();
      const payload = {
        intro: values.intro,
        vision: values.vision,
        mission: values.mission,
        core_values: values.core_values,
      };

      if (aboutContent) {
        await createAbout(payload).unwrap();
        toast.success("Cập nhật thông tin giới thiệu thành công!");
      }
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Lưu thông tin giới thiệu thất bại. Vui lòng thử lại.");
    }
  }

  useLayoutEffect(() => {
    if (form && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [aboutContent, form]);

  return (
    <ComponentCard>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <Title level={4}>Quản lý thông tin giới thiệu</Title>
            <Text type="secondary" className="text-sm">
              Sửa nội dung hiển thị trên trang giới thiệu.
            </Text>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isFetching || isGetting || isCreating}
              loading={isGetting || isFetching || isCreating}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <FormItem
          label="Giới thiệu chung"
          name="intro"
          className="mb-6"
          required
          rules={[{ required: true, message: "Vui lòng nhập giới thiệu chung." }]}
        >
          <TextArea placeholder="Nhập nội dung" rows={6} disabled={isFetching || isGetting} />
        </FormItem>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Tầm nhìn"
            name="vision"
            className="mb-6"
            required
            rules={[{ required: true, message: "Vui lòng nhập tầm nhìn." }]}
          >
            <TextArea placeholder="Nhập nội dung" rows={5} disabled={isFetching || isGetting} />
          </FormItem>

          <FormItem
            label="Sứ mệnh"
            name="mission"
            className="mb-6"
            required
            rules={[{ required: true, message: "Vui lòng nhập sứ mệnh." }]}
          >
            <TextArea placeholder="Nhập nội dung" rows={5} disabled={isFetching || isGetting} />
          </FormItem>
        </div>

        <Form.List name="core_values">
          {(fields, { add, remove }) => (
            <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-lg font-semibold">Giá trị cốt lõi</h4>
                <Button
                  size="md"
                  disabled={isFetching || isGetting}
                  loading={isGetting || isFetching}
                  onClick={() => add("")}
                >
                  Thêm giá trị
                </Button>
              </div>

              <div className="space-y-1">
                {fields.map(({ key, name }) => (
                  <div key={key} className="flex gap-3 items-start">
                    <Form.Item
                      name={name}
                      className="flex-1 mb-1!"
                      rules={[{ required: true, message: "Vui lòng nhập giá trị cốt lõi." }]}
                    >
                      <Input placeholder="Nhập nội dung" disabled={isFetching || isGetting} />
                    </Form.Item>

                    <button
                      type="button"
                      onClick={() => remove(name)}
                      disabled={isFetching || isGetting}
                      className="text-red-500 border-red-200 border px-4 py-2 rounded-lg hover:border-red-400 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                ))}

                {fields.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Chưa có giá trị cốt lõi nào. Nhấn "Thêm giá trị" để bắt đầu.
                  </p>
                )}
              </div>
            </section>
          )}
        </Form.List>
      </Form>
    </ComponentCard>
  );
}
