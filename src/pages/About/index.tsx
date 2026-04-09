import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import FormItem from "antd/es/form/FormItem";
import { useLayoutEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import { useCreateAboutMutation, useGetAboutQuery } from "../../services/about.service";

const { Title, Text } = Typography;

interface CoreValueInputItem {
  id: string;
  title: string;
}

interface AboutData {
  intro: string;
  vision: string;
  mission: string;
  coreValue: CoreValueInputItem[];
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AboutPage() {
  const [form] = useForm();
  const { data: aboutContent, isFetching } = useGetAboutQuery();
  const [createAbout, { isLoading: isCreating }] = useCreateAboutMutation();
  const isSaving = isCreating;

  const initialData = useMemo<AboutData>(
    () => ({
      intro: aboutContent?.intro ?? "",
      vision: aboutContent?.vision ?? "",
      mission: aboutContent?.mission ?? "",
      coreValue:
        aboutContent?.coreValue?.map((item) => ({
          id: genId(),
          title: item.title,
        })) ?? [],
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
        coreValue: values.coreValue.map((item: CoreValueInputItem, index: number) => ({
          title: item.title,
          index,
        })),
      };

      // Làm cho một công ty nên không cần update vì chỉ có một about
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
    <section className="w-full space-y-6 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div className="flex items-center justify-between mb-4">
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
              loading={isSaving}
              disabled={isFetching}
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
          <TextArea placeholder="Nhập nội dung" rows={6} disabled={isFetching} />
        </FormItem>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Tầm nhìn"
            name="vision"
            className="mb-6"
            required
            rules={[{ required: true, message: "Vui lòng nhập tầm nhìn." }]}
          >
            <TextArea placeholder="Nhập nội dung" rows={5} disabled={isFetching} />
          </FormItem>

          <FormItem
            label="Sứ mệnh"
            name="mission"
            className="mb-6"
            required
            rules={[{ required: true, message: "Vui lòng nhập sứ mệnh." }]}
          >
            <TextArea placeholder="Nhập nội dung" rows={5} disabled={isFetching} />
          </FormItem>
        </div>

        <Form.List name="coreValue">
          {(fields, { add, remove }) => (
            <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold">Giá trị cốt lõi</h4>
                <Button
                  size="md"
                  disabled={isFetching}
                  onClick={() => add({ id: genId(), title: "" })}
                >
                  Thêm giá trị
                </Button>
              </div>

              <div className="space-y-1">
                {fields.map(({ key, name }) => (
                  <div key={key} className="flex gap-3 items-start">
                    <Form.Item name={[name, "id"]} hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      name={[name, "title"]}
                      className="flex-1 mb-1!"
                      rules={[{ required: true, message: "Vui lòng nhập giá trị cốt lõi." }]}
                    >
                      <Input placeholder="Nhập nội dung" disabled={isFetching} />
                    </Form.Item>

                    <button
                      type="button"
                      onClick={() => remove(name)}
                      disabled={isFetching}
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
    </section>
  );
}
