import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLayoutEffect, useState } from "react";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import ManuProcessStepList from "../../components/manuProcess/ManuProcessStepList";
import ManuProcessStepModal from "../../components/manuProcess/ManuProcessStepModal";
import Button from "../../components/ui/button/Button";
import useModal from "../../hooks/useModal";
import {
  useCreateManuProcessUpsertMutation,
  useGetManuProcessQuery,
} from "../../services/manuProcess.service";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import type { ManuProcess, ManuProcessStep } from "../../types/manuProcess.type";

const { Title, Text } = Typography;

export default function ManufacturingProcessPage() {
  const [form] = useForm();
  const { open, openModal, closeModal, data: dataEditing } = useModal<ManuProcessStep>();
  const [orderedSteps, setOrderedSteps] = useState<ManuProcessStep[]>([]);

  const { data: manuProcess, isFetching, isLoading: manuProcessLoading } = useGetManuProcessQuery();

  const [createManuProcessUpsert, { isLoading: isCreating }] = useCreateManuProcessUpsertMutation();
  const [uploadImage] = useUploadImageMutation();
  const [deleteImage] = useDeleteImageMutation();

  const applyServerManuData = (data: ManuProcess) => {
    form.setFieldsValue({
      title: data.title,
      intro: data.intro,
    });

    setOrderedSteps(data.steps || []);
  };

  const handleSave = async (values: ManuProcess) => {
    try {
      await createManuProcessUpsert(values).unwrap();
      toast.success("Đã lưu quy trình sản xuất.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu quy trình sản xuất.");
    }
  };

  const buildNewStepPayload = (values: ManuProcess, step: ManuProcessStep): ManuProcess => ({
    ...values,
    steps: [...(manuProcess?.steps || []), { title: step.title, content: step.content }],
  });

  const buildUpdatedStepPayload = (values: ManuProcess, step: ManuProcessStep): ManuProcess => ({
    ...values,
    steps:
      manuProcess?.steps.map((s) =>
        s.id === dataEditing?.id ? { id: s.id, title: step.title, content: step.content } : s,
      ) || [],
  });

  const uploadStepImage = async (image: File, stepId: string) => {
    try {
      uploadImage({ files: [image], type: "manu-process", id: stepId }).unwrap();
    } catch (error) {
      console.error("Error uploading step image:", error);
      toast.error("Đã có lỗi xảy ra khi tải ảnh bước lên. Vui lòng thử lại.");
    }
  };

  const handleAddNewStep = async (values: ManuProcess, step: ManuProcessStep) => {
    const payload = buildNewStepPayload(values, step);
    const upserted = await createManuProcessUpsert(payload).unwrap();

    const newStepFromServer = upserted?.steps.at(-1);
    if (!newStepFromServer?.id) return;

    toast.success("Đã thêm bước mới vào quy trình sản xuất.");

    if (step.image instanceof File) {
      uploadStepImage(step.image, newStepFromServer.id);
    }
  };

  const handleUpdateStep = async (values: ManuProcess, step: ManuProcessStep) => {
    const payload = buildUpdatedStepPayload(values, step);
    await createManuProcessUpsert(payload).unwrap();

    toast.success("Đã cập nhật bước trong quy trình sản xuất.");

    if (step.image instanceof File) {
      Promise.allSettled([
        handleDeleteStepImg(dataEditing?.images?.[0]?.id ?? ""),
        uploadStepImage(step.image, dataEditing!.id!),
      ]);
    }
  };

  const handleSaveStep = async (step: ManuProcessStep) => {
    try {
      const values = await form.validateFields();

      if (!dataEditing?.id) {
        await handleAddNewStep(values, step);
      } else {
        await handleUpdateStep(values, step);
      }
    } catch (error) {
      console.error("save step failed:", error);
      toast.error("Không thể lưu bước quy trình.");
    }
  };

  const handleDeleteStepImg = async (imageId: string) => {
    try {
      await deleteImage({ id: imageId }).unwrap();
    } catch (error) {
      console.error("delete step image failed:", error);
      toast.error("Không thể xóa ảnh bước quy trình.");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      if (manuProcess) {
        const payload: ManuProcess = {
          ...manuProcess,
          steps: manuProcess?.steps.filter((s) => s.id !== stepId) || [],
        };
        await createManuProcessUpsert(payload).unwrap();
        toast.success("Đã xóa bước khỏi quy trình sản xuất.");
      }
    } catch (error) {
      console.error("delete step failed:", error);
      toast.error("Không thể xóa bước quy trình.");
    }
  };

  useLayoutEffect(() => {
    if (form && manuProcess) {
      applyServerManuData(manuProcess);
    }
  }, [manuProcess, form]);

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
            <Button type="submit" variant="primary" size="md" loading={manuProcessLoading}>
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <Form.Item
          label="Tiêu đề hiển thị"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề hiển thị." }]}
        >
          <Input placeholder="VD: Quy trình sản xuất" disabled={manuProcessLoading || isFetching} />
        </Form.Item>

        <Form.Item label="Mô tả" name="intro">
          <TextArea
            rows={10}
            placeholder="Mô tả quy trình sản xuất"
            disabled={manuProcessLoading || isFetching}
          />
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
                <Button
                  variant="primary"
                  onClick={() => openModal(undefined)}
                  loading={manuProcessLoading || isCreating}
                >
                  Thêm bước
                </Button>
              </div>
            </div>

            <ManuProcessStepList
              steps={orderedSteps}
              onEdit={(record) => openModal(record)}
              onReorder={setOrderedSteps}
              onDelete={handleDeleteStep}
            />

            <ManuProcessStepModal
              title=""
              open={open}
              onClose={closeModal}
              onSave={handleSaveStep}
              initialValue={dataEditing || undefined}
              isSaving={manuProcessLoading || isCreating}
            />
          </section>
        </Form.Item>
      </Form>
    </ComponentCard>
  );
}
