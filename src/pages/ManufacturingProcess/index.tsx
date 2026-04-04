import { Typography } from "antd";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import UploadImageBox from "../../components/common/UpdloadImageBox";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import {
  useCreateAdminManuProcessMutation,
  useGetAdminManuProcessQuery,
  useGetManuProcessQuery,
  useUpdateAdminManuProcessMutation,
  useUploadAdminManuProcessStepImageMutation,
} from "../../services/manuProcess.service";
import type { ManuProcessStep } from "../../types/manuProcess.type";

const { Title, Text } = Typography;

type StepDraft = {
  id?: number;
  title: string;
  content: string;
  imgUrl: string | null;
  index: number;
};

const toDraftSteps = (steps: ManuProcessStep[]) =>
  (steps || []).map((step, idx) => ({
    id: typeof step.id === "number" ? step.id : undefined,
    title: String(step.title || ""),
    content: String(step.content || ""),
    imgUrl: step.imgUrl ? String(step.imgUrl) : null,
    index: step.index || idx + 1,
  }));

export default function ManufacturingProcessPage() {
  const { data: publicManuProcess } = useGetManuProcessQuery();
  const { data: adminManuProcess = [], isFetching } =
    useGetAdminManuProcessQuery();

  const [createManuProcess, { isLoading: isCreating }] =
    useCreateAdminManuProcessMutation();
  const [updateManuProcess, { isLoading: isUpdating }] =
    useUpdateAdminManuProcessMutation();
  const [uploadStepImage, { isLoading: isUploading }] =
    useUploadAdminManuProcessStepImageMutation();

  const existingItem = useMemo(() => adminManuProcess[0], [adminManuProcess]);

  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [introDraft, setIntroDraft] = useState<string | null>(null);
  const [stepsDraft, setStepsDraft] = useState<StepDraft[] | null>(null);
  const [filesByStepIndex, setFilesByStepIndex] = useState<
    Record<number, File | null>
  >({});

  const steps = stepsDraft ?? toDraftSteps(publicManuProcess?.process || []);
  const title = titleDraft ?? String(publicManuProcess?.title || "");
  const intro = introDraft ?? String(publicManuProcess?.intro || "");

  const isSaving = isCreating || isUpdating || isUploading;

  const updateStep = (index: number, patch: Partial<StepDraft>) => {
    setStepsDraft(
      steps.map((step) =>
        step.index === index
          ? {
              ...step,
              ...patch,
            }
          : step,
      ),
    );
  };

  const addStep = () => {
    const nextIndex = steps.length + 1;
    setStepsDraft([
      ...steps,
      {
        title: "",
        content: "",
        imgUrl: null,
        index: nextIndex,
      },
    ]);
  };

  const removeStep = (index: number) => {
    const nextSteps = steps
      .filter((step) => step.index !== index)
      .map((step, idx) => ({
        ...step,
        index: idx + 1,
      }));

    setStepsDraft(nextSteps);
    setFilesByStepIndex((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleSave = async () => {
    const nextTitle = title.trim();
    const nextIntro = intro.trim();

    if (!nextTitle || !nextIntro) {
      toast.warning("Vui lòng nhập tiêu đề và mô tả tổng quan.");
      return;
    }

    const normalizedSteps = steps.map((step, idx) => ({
      title: step.title.trim(),
      content: step.content.trim(),
      imgUrl: step.imgUrl,
      index: idx + 1,
    }));

    if (normalizedSteps.some((step) => !step.title || !step.content)) {
      toast.warning("Vui lòng nhập đầy đủ tiêu đề và nội dung cho từng step.");
      return;
    }

    try {
      if (existingItem?.id) {
        await updateManuProcess({
          id: existingItem.id,
          body: {
            title: nextTitle,
            intro: nextIntro,
            process: normalizedSteps,
          },
        }).unwrap();
      } else {
        await createManuProcess({
          title: nextTitle,
          intro: nextIntro,
          process: normalizedSteps,
        }).unwrap();
      }

      for (const step of normalizedSteps) {
        const file = filesByStepIndex[step.index];
        if (!file) continue;

        await uploadStepImage({
          index: step.index,
          file,
        }).unwrap();
      }

      setFilesByStepIndex({});
      toast.success("Đã lưu quy trình sản xuất.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu quy trình sản xuất.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="mb-1!">
            Quản lý quy trình sản xuất
          </Title>
          <Text type="secondary" className="text-sm">
            Quản lý phần giới thiệu quy trình và danh sách các bước sản xuất.
          </Text>
        </div>
        <Button
          onClick={() => void handleSave()}
          loading={isSaving}
          disabled={isFetching}
        >
          Lưu thay đổi
        </Button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 space-y-4">
        <div>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
            Tiêu đề quy trình
          </p>
          <Input
            value={title}
            onChange={(event) => setTitleDraft(event.target.value)}
            placeholder="Nhập tiêu đề"
            disabled={isFetching}
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
            Mô tả tổng quan
          </p>
          <TextArea
            rows={4}
            value={intro}
            onChange={setIntroDraft}
            placeholder="Nhập mô tả"
            disabled={isFetching}
          />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Danh sách step
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={addStep}
            disabled={isFetching}
          >
            Thêm step
          </Button>
        </div>

        {steps.map((step) => (
          <div
            key={`step-${step.index}`}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-700 dark:text-gray-200">
                Step {step.index}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeStep(step.index)}
                disabled={isFetching}
              >
                Xóa
              </Button>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                Tiêu đề
              </p>
              <Input
                value={step.title}
                onChange={(event) =>
                  updateStep(step.index, { title: event.target.value })
                }
                placeholder="Nhập tiêu đề step"
                disabled={isFetching}
              />
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                Nội dung
              </p>
              <TextArea
                rows={3}
                value={step.content}
                onChange={(value) => updateStep(step.index, { content: value })}
                placeholder="Nhập mô tả step"
                disabled={isFetching}
              />
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                Ảnh step
              </p>
              {step.imgUrl ? (
                <img
                  src={step.imgUrl}
                  alt={`step-${step.index}`}
                  className="mb-3 h-36 w-full rounded object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : null}
              <UploadImageBox
                onChange={(file) =>
                  setFilesByStepIndex((prev) => ({
                    ...prev,
                    [step.index]: file,
                  }))
                }
                maxSizeMB={2}
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
