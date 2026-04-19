import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLayoutEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import ManuProcessStepList from "../../components/manuProcess/ManuProcessStepList";
import ManuProcessStepModal, {
  type ManuProcessStepModalValue,
} from "../../components/manuProcess/ManuProcessStepModal";
import Button from "../../components/ui/button/Button";
import {
  useCreateManuProcessUpsertMutation,
  useGetManuProcessQuery,
} from "../../services/manuProcess.service";
import { useUploadImageMutation } from "../../services/upload.service";
import type { ManuProcess, ManuProcessStep } from "../../types/manuProcess.type";

const { Title, Text } = Typography;

export default function ManufacturingProcessPage() {
  const [openStepModal, setOpenStepModal] = useState<boolean>(false);
  const [editingStepLocalId, setEditingStepLocalId] = useState<string | null>(null);
  const [steps, setSteps] = useState<ManuProcessStep[]>([]);
  const [form] = useForm();

  const { data: manuProcess, isFetching, isLoading: isGetting } = useGetManuProcessQuery();

  const [createManuProcessUpsert, { isLoading: isCreating }] = useCreateManuProcessUpsertMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  const stepModalTitle = useMemo(
    () => (editingStepLocalId ? "Chỉnh sửa bước quy trình" : "Thêm bước quy trình"),
    [editingStepLocalId],
  );

  const editingStep = useMemo(
    () => steps.find((step) => step.localId === editingStepLocalId) ?? null,
    [editingStepLocalId, steps],
  );

  const applyServerManuData = (data: ManuProcess) => {
    form.setFieldsValue({
      title: data.title,
      intro: data.intro,
    });
  };

  const handleSave = async (values: ManuProcess) => {
    try {
      // await createManuProcessUpsert(payload).unwrap();
      toast.success("Đã lưu quy trình sản xuất.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu quy trình sản xuất.");
    }
  };

  const handleSaveStep = async (value: ManuProcessStepModalValue) => {
    try {
      toast.success("Đã lưu bước quy trình.");
    } catch (error) {
      console.error("save step failed:", error);
      toast.error("Không thể lưu bước quy trình.");
    }
  };

  useLayoutEffect(() => {
    if (form && manuProcess) {
      applyServerManuData(manuProcess);
    }
  }, [manuProcess, form]);

  const handleDeleteStep = (localId: string) => {
    setSteps((prev) => prev.filter((step) => step.localId !== localId));
  };

  return (
    <ComponentCard>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <Title level={4}>Quản lý quy trình sản xuất</Title>
            <Text type="secondary" className="text-sm">
              Cập nhật quy trình sản xuất để khách hàng hiểu rõ hơn về cách chúng tôi tạo ra sản
              phẩm.
            </Text>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="md" loading={isCreating}>
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <Form.Item
          label="Tiêu đề hiển thị"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề hiển thị." }]}
        >
          <Input placeholder="VD: Quy trình sản xuất" />
        </Form.Item>

        <Form.Item label="Mô tả" name="intro">
          <TextArea rows={10} placeholder="Mô tả quy trình sản xuất" />
        </Form.Item>

        <Form.Item name="steps">
          <section className="space-y-3">
            <div className="flex items-start justify-between pb-1!">
              <div>
                <Title level={4} className="mb-1!">
                  Các bước trong quy trình sản xuất
                </Title>
                <Text type="secondary" className="text-sm">
                  Kéo thả để sắp xếp lại thứ tự các bước.
                </Text>
              </div>
              <div className="space-x-2">
                <Button variant="primary" onClick={() => {}}>
                  Thêm bước
                </Button>
              </div>
            </div>

            <ManuProcessStepList
              steps={steps}
              onEdit={() => {}}
              onDelete={handleDeleteStep}
              onReorder={setSteps}
            />

            <ManuProcessStepModal
              title={stepModalTitle}
              open={openStepModal}
              onClose={() => {}}
              onSave={handleSaveStep}
              initialValue={undefined}
              isSaving={isCreating || isUploadingImage}
            />
          </section>
        </Form.Item>
      </Form>
    </ComponentCard>
  );
}
