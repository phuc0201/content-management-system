import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLayoutEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import ManuProcessStepList from "../../components/manuProcess/ManuProcessStepList";
import ManuProcessStepModal from "../../components/manuProcess/ManuProcessStepModal";
import Button from "../../components/ui/button/Button";
import useModal from "../../hooks/useModal";
import {
  manuProcessService,
  useCreateManuStepMutation,
  useGetManuProcessQuery,
  useUpdateManuStepMutation,
  useUpsertManuProcessMutation,
} from "../../services/manuProcess.service";
import { useDeleteSiteConfigMutation } from "../../services/siteConfig.service";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import type { ManuProcess, ManuProcessStep, ManuStepImage } from "../../types/manuProcess.type";

const { Title, Text } = Typography;

export default function ManufacturingProcessPage() {
  const [form] = useForm();
  const dispatch = useDispatch();

  const { open, openModal, closeModal, data: dataEditing } = useModal<ManuProcessStep>();
  const [orderedSteps, setOrderedSteps] = useState<ManuProcessStep[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const isSavingOrderRef = useRef(false);
  const serverOrderRef = useRef<string[]>([]);

  const { data: manuProcess, isLoading: manuProcessLoading } = useGetManuProcessQuery();

  const [createManuProcessUpsert, { isLoading: isUpserting }] = useUpsertManuProcessMutation();
  const [createManuStep] = useCreateManuStepMutation();
  const [updateManuStep, { isLoading: isStepUpdating }] = useUpdateManuStepMutation();
  const [uploadImage, { isLoading: isImageUploading }] = useUploadImageMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [deleteSiteConfig] = useDeleteSiteConfigMutation();

  const applyServerManuData = (data: ManuProcess) => {
    form.setFieldsValue({
      title: data.title,
      intro: data.intro,
    });

    serverOrderRef.current = (data.steps || []).map((step) => step.id ?? "");
    setOrderedSteps(data.steps || []);
  };

  const getStepOrderKey = (steps: ManuProcessStep[]) =>
    steps.map((step) => step.id ?? "").join("|");

  const isOrderDirty = getStepOrderKey(orderedSteps) !== serverOrderRef.current.join("|");

  const handleSave = async (values: ManuProcess) => {
    try {
      const payload = {
        title: values.title,
        intro: values.intro,
      };
      await createManuProcessUpsert(payload).unwrap();
      toast.success("Đã lưu quy trình sản xuất.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu quy trình sản xuất.");
    }
  };

  const handleSaveOrder = async () => {
    if (!manuProcess || !isOrderDirty) return;

    try {
      isSavingOrderRef.current = true;
      setIsSavingOrder(true);

      for (const [position, step] of orderedSteps.entries()) {
        if (!step.id) {
          throw new Error(`Step missing id at position ${position}`);
        }

        await updateManuStep({
          id: step.id,
          title: step.title,
          content: step.content,
          index: position + 1,
        }).unwrap();
      }

      serverOrderRef.current = orderedSteps.map((step) => step.id ?? "");
      toast.success("Đã lưu thứ tự các bước.");
    } catch (error) {
      console.error("save reorder failed:", error);
      toast.error("Không thể lưu thứ tự các bước.");
    } finally {
      isSavingOrderRef.current = false;
      setIsSavingOrder(false);
    }
  };

  const uploadStepImage = async (image: File, stepId: string) => {
    try {
      return await uploadImage({ files: [image], type: "manu-process", id: stepId }).unwrap();
    } catch (error) {
      console.error("Error uploading step image:", error);
      toast.error("Đã có lỗi xảy ra khi tải ảnh bước lên. Vui lòng thử lại.");
    }
  };

  const syncStepImage = (stepId: string, stepImage: ManuStepImage) => {
    dispatch(
      (manuProcessService.util.updateQueryData as any)(
        "getManuProcess",
        undefined,
        (draft: ManuProcess | null) => {
          if (!draft) return;
          const stepIndex = draft.steps.findIndex((step: ManuProcessStep) => step.id === stepId);
          if (stepIndex !== -1) {
            draft.steps[stepIndex].image = stepImage;
            draft.steps[stepIndex].imageId = stepImage.id;
          }
        },
      ),
    );
  };

  const handleAddNewStep = async (step: ManuProcessStep) => {
    try {
      const payload = {
        title: step.title,
        content: step.content,
      };

      const createdStep = await createManuStep(payload).unwrap();

      if (step?.imagePreview instanceof File && createdStep?.data?.id) {
        const uploadedImage = await uploadStepImage(step.imagePreview, createdStep.data.id);
        dispatch(
          (manuProcessService.util.updateQueryData as any)(
            "getManuProcess",
            undefined,
            (draft: ManuProcess | null) => {
              if (!draft) return;
              draft.steps.push({
                id: createdStep?.data?.id,
                title: step.title,
                content: step.content,
                image: undefined,
              });
            },
          ),
        );
        if (uploadedImage?.data) syncStepImage(createdStep.data.id, uploadedImage.data[0]);
      }

      toast.success("Đã thêm bước mới vào quy trình sản xuất.");
    } catch (error) {
      console.error("add new step failed:", error);
      toast.error("Không thể thêm bước mới vào quy trình sản xuất.");
    }
  };

  const handleUpdateStep = async (step: ManuProcessStep) => {
    if (!step?.id) {
      toast.error("Chức năng cập nhật bước hiện chưa khả dụng. Vui lòng thử lại sau.");
      return;
    }

    const payload = {
      id: step.id,
      title: step.title,
      content: step.content,
    };

    await updateManuStep(payload).unwrap();

    if (step?.imageId !== "" && step?.imageId !== null) {
      handleDeleteStepImg(step.imageId!);
    }

    if (step?.imagePreview instanceof File) {
      const uploadedImage = await uploadStepImage(step?.imagePreview, step?.id);
      if (uploadedImage?.data) syncStepImage(step?.id, uploadedImage?.data[0]);
    }

    toast.success("Đã cập nhật bước trong quy trình sản xuất.");
  };

  const handleSaveStep = async (step: ManuProcessStep) => {
    try {
      if (!dataEditing?.id) {
        await handleAddNewStep(step);
      } else {
        await handleUpdateStep(step);
      }
      closeModal();
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
      await deleteSiteConfig(stepId).unwrap();

      dispatch(
        (manuProcessService.util.updateQueryData as any)(
          "getManuProcess",
          undefined,
          (draft: ManuProcess | null) => {
            if (!draft) return;
            draft.steps = draft.steps.filter((step: ManuProcessStep) => step.id !== stepId);
          },
        ),
      );

      setOrderedSteps((prev) => prev.filter((step) => step.id !== stepId));

      toast.success("Đã xóa bước khỏi quy trình sản xuất.");
    } catch (error) {
      console.error("delete step failed:", error);
      toast.error("Không thể xóa bước quy trình.");
    }
  };

  useLayoutEffect(() => {
    if (form && manuProcess && !isSavingOrderRef.current) {
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
            <Button type="submit" variant="primary" size="md" loading={isUpserting}>
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <Form.Item
          label="Tiêu đề hiển thị"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề hiển thị." }]}
        >
          <Input
            placeholder="VD: Quy trình sản xuất"
            disabled={manuProcessLoading || isUpserting}
          />
        </Form.Item>

        <Form.Item label="Mô tả" name="intro">
          <TextArea
            rows={10}
            placeholder="Mô tả quy trình sản xuất"
            disabled={manuProcessLoading || isUpserting}
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
                {isOrderDirty ? (
                  <Button
                    variant="outline"
                    onClick={handleSaveOrder}
                    loading={isSavingOrder}
                    disabled={isSavingOrder}
                  >
                    Lưu thứ tự
                  </Button>
                ) : null}
                <Button
                  variant="primary"
                  onClick={() => openModal(undefined)}
                  disabled={isSavingOrder}
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
              isSaving={isStepUpdating || isImageUploading}
            />
          </section>
        </Form.Item>
      </Form>
    </ComponentCard>
  );
}
