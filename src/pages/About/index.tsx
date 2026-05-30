import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Form, Spin, Tooltip, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import FormItem from "antd/es/form/FormItem";
import useModal from "antd/es/modal/useModal";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { LuRefreshCw } from "react-icons/lu";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import DeleteButton from "../../components/table/DeleteButton";
import Button from "../../components/ui/button/Button";
import {
  useCreateAboutUpsertMutation,
  useGetAboutQuery,
} from "../../services/about.service";
import type { AboutContent } from "../../types/about.type";

const { Title, Text } = Typography;

export default function AboutPage() {
  const [form] = useForm();
  const [modal, contextHolder] = useModal();
  const isDirty = useRef(false);
  const coreValuesRef = useRef<HTMLDivElement>(null);

  const {
    data: aboutContent,
    isFetching,
    isLoading: isGetting,
  } = useGetAboutQuery();
  const [createAbout, { isLoading: isCreating }] =
    useCreateAboutUpsertMutation();

  const isDisabled = isFetching || isGetting || isCreating;

  const initialData = useMemo<AboutContent>(
    () => ({
      intro: aboutContent?.intro ?? "",
      vision: aboutContent?.vision ?? "",
      mission: aboutContent?.mission ?? "",
      core_values: aboutContent?.core_values || [],
    }),
    [aboutContent],
  );

  const handleResetCoreValues = useCallback(() => {
    modal.confirm({
      title: "Khôi phục giá trị cốt lõi?",
      centered: true,
      icon: <ExclamationCircleOutlined />,
      content:
        "Các thay đổi chưa lưu trong danh sách giá trị cốt lõi sẽ bị mất.",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: () => {
        form.setFieldValue("core_values", aboutContent?.core_values || []);
      },
    });
  }, [modal, form, aboutContent]);

  const handleAddCoreValue = useCallback(
    (add: (defaultValue?: string) => void) => {
      add("");
      // Scroll to bottom on mobile after adding
      setTimeout(() => {
        if (coreValuesRef.current && window.innerWidth < 768) {
          const allInputs = coreValuesRef.current.querySelectorAll("input");
          const lastInput = allInputs[allInputs.length - 1];
          if (lastInput) {
            lastInput.scrollIntoView({ behavior: "smooth", block: "center" });
            lastInput.focus();
          }
        }
      }, 100);
    },
    [],
  );

  async function handleSave() {
    try {
      const values = await form.validateFields();
      const payload: AboutContent = {
        intro: values.intro,
        vision: values.vision,
        mission: values.mission,
        core_values: values.core_values,
      };

      await createAbout(payload).unwrap();
      isDirty.current = false;
      toast.success("Cập nhật thông tin giới thiệu thành công!");
    } catch (error) {
      console.error("Validation failed:", error);
      toast.error("Lưu thông tin giới thiệu thất bại. Vui lòng thử lại.");
    }
  }

  useLayoutEffect(() => {
    if (form && initialData) {
      form.setFieldsValue(initialData);
      isDirty.current = false;
    }
  }, [aboutContent, form]);

  return (
    <div className="relative">
      {contextHolder}

      {isGetting && (
        <div className="fixed inset-0 z-1000 w-screen h-screen flex items-center justify-center bg-white/20 dark:bg-black/40 backdrop-blur-xs pointer-events-auto">
          <Spin size="small" description="Đang tải thông tin..." />
        </div>
      )}

      <ComponentCard>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onValuesChange={() => {
            isDirty.current = true;
          }}
        >
          {/* Header */}
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
            <div>
              <Title level={4}>Quản lý thông tin giới thiệu</Title>
              <Text type="secondary" className="text-sm">
                Sửa nội dung hiển thị trên trang giới thiệu.
              </Text>
            </div>
            <div className="sm:flex hidden">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isDisabled}
                loading={isDisabled}
                className="w-full sm:w-auto"
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>

          {/* Giới thiệu chung */}
          <FormItem
            label="Giới thiệu chung"
            name="intro"
            className="mb-6"
            required
            rules={[
              { required: true, message: "Vui lòng nhập giới thiệu chung." },
            ]}
          >
            <TextArea
              placeholder="Nhập nội dung"
              rows={6}
              disabled={isFetching || isGetting}
            />
          </FormItem>

          {/* Tầm nhìn & Sứ mệnh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem
              label="Tầm nhìn"
              name="vision"
              className="mb-6"
              required
              rules={[{ required: true, message: "Vui lòng nhập tầm nhìn." }]}
            >
              <TextArea
                placeholder="Nhập nội dung"
                rows={5}
                disabled={isFetching || isGetting}
              />
            </FormItem>

            <FormItem
              label="Sứ mệnh"
              name="mission"
              className="mb-6"
              required
              rules={[{ required: true, message: "Vui lòng nhập sứ mệnh." }]}
            >
              <TextArea
                placeholder="Nhập nội dung"
                rows={5}
                disabled={isFetching || isGetting}
              />
            </FormItem>
          </div>

          {/* Giá trị cốt lõi */}
          <Form.List name="core_values">
            {(fields, { add, remove }) => (
              <section
                ref={coreValuesRef}
                className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-4 sm:p-6 mb-6 pb-20 md:pb-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">Giá trị cốt lõi</h4>
                    {fields.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fields.length} giá trị
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip title="Khôi phục về dữ liệu đã lưu">
                      <button
                        type="button"
                        aria-label="Khôi phục giá trị cốt lõi về dữ liệu đã lưu"
                        onClick={handleResetCoreValues}
                        disabled={isFetching || isGetting}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LuRefreshCw size={16} />
                      </button>
                    </Tooltip>
                    <Button
                      size="md"
                      disabled={isFetching || isGetting}
                      loading={isGetting || isFetching}
                      onClick={() => handleAddCoreValue(add)}
                      className="flex-1 sm:flex-none"
                    >
                      Thêm giá trị
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {fields.map(({ key, name }) => (
                    <div key={key} className="flex gap-2 sm:gap-3 items-start">
                      {/* Số thứ tự */}
                      <span className="text-gray-400 text-sm min-w-5 pt-2.5 text-right select-none">
                        {name + 1}.
                      </span>

                      <Form.Item
                        name={name}
                        className="flex-1 mb-1!"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập giá trị cốt lõi.",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Nhập nội dung"
                          disabled={isFetching || isGetting}
                        />
                      </Form.Item>

                      <DeleteButton
                        onClick={() => remove(name)}
                        disabled={isFetching || isGetting}
                      />
                    </div>
                  ))}

                  {fields.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Chưa có giá trị cốt lõi nào. Nhấn "Thêm giá trị" để bắt
                      đầu.
                    </p>
                  )}
                </div>
              </section>
            )}
          </Form.List>

          {/* Sticky bottom bar */}
          <div className="flex sm:hidden md:relative fixed inset-x-0 bottom-0 md:pt-5 md:px-0 md:pb-0 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 p-4 backdrop-blur">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isDisabled}
              loading={isDisabled}
              className="w-full sm:w-auto"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </ComponentCard>
    </div>
  );
}
