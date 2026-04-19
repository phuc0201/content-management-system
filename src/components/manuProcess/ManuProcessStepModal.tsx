import { useEffect, useMemo, useState } from "react";
import UploadImageBox from "../common/UpdloadImageBox";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import { ModalShared } from "../ui/modal";

export interface ManuProcessStepModalValue {
  title: string;
  content: string;
  imageFile: File | null;
}

export interface ManuProcessStepModalInitialValue {
  title?: string;
  content?: string;
  imagePreviewUrl?: string | null;
}

interface ManuProcessStepModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (value: ManuProcessStepModalValue) => void;
  initialValue?: ManuProcessStepModalInitialValue;
  title?: string;
  isSaving?: boolean;
}

export default function ManuProcessStepModal({
  open,
  onClose,
  onSave,
  initialValue,
  title,
  isSaving = false,
}: ManuProcessStepModalProps) {
  const [stepTitle, setStepTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [titleError, setTitleError] = useState<string>("");
  const [contentError, setContentError] = useState<string>("");

  const uploadValue = useMemo<File | string | null>(() => {
    if (imageFile) return imageFile;
    return initialValue?.imagePreviewUrl ?? null;
  }, [imageFile, initialValue?.imagePreviewUrl]);

  useEffect(() => {
    if (!open) return;
    setStepTitle(initialValue?.title ?? "");
    setContent(initialValue?.content ?? "");
    setImageFile(null);
    setTitleError("");
    setContentError("");
  }, [initialValue?.content, initialValue?.title, open]);

  const handleSubmit = () => {
    const normalizedTitle = stepTitle.trim();
    const normalizedContent = content.trim();

    const nextTitleError = normalizedTitle ? "" : "Vui lòng nhập tiêu đề bước.";
    const nextContentError = normalizedContent ? "" : "Vui lòng nhập nội dung bước.";

    setTitleError(nextTitleError);
    setContentError(nextContentError);

    if (nextTitleError || nextContentError) return;

    onSave({
      title: normalizedTitle,
      content: normalizedContent,
      imageFile,
    });
  };

  return (
    <ModalShared
      isOpen={open}
      onClose={onClose}
      title={title}
      onSave={handleSubmit}
      isSaving={isSaving}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Tiêu đề bước</p>
          <Input
            value={stepTitle}
            onChange={(e) => setStepTitle(e.target.value)}
            error={Boolean(titleError)}
          />
          {titleError ? <p className="mt-1 text-xs text-red-500">{titleError}</p> : null}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Nội dung</p>
          <TextArea
            rows={5}
            value={content}
            onChange={(value) => setContent(value)}
            error={Boolean(contentError)}
          />
          {contentError ? <p className="mt-1 text-xs text-red-500">{contentError}</p> : null}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Hình ảnh</p>
          <UploadImageBox
            value={uploadValue}
            onChange={(file) => setImageFile(file)}
            maxSizeMB={5}
          />
        </div>
      </div>
    </ModalShared>
  );
}
