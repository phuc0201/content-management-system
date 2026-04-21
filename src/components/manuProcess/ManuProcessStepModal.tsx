import { Form, Input } from "antd";
import { useEffect } from "react";
import { config } from "../../config";
import type { ManuProcessStep } from "../../types/manuProcess.type";
import UploadImageBox from "../common/UpdloadImageBox";
import { ModalShared } from "../ui/modal";

const { TextArea } = Input;

interface ManuProcessStepModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (value: ManuProcessStep) => void;
  initialValue?: ManuProcessStep;
  title?: string;
  isSaving?: boolean;
}

export default function ManuProcessStepModal({
  open,
  onClose,
  onSave,
  initialValue,
  title,
}: ManuProcessStepModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      id: initialValue?.id,
      title: initialValue?.title ?? "",
      content: initialValue?.content ?? "",
      image:
        initialValue?.images && initialValue.images.length > 0
          ? config.imageBaseUrl + initialValue.images[0].url
          : null,
    });
  }, [form, initialValue, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <ModalShared isOpen={open} onClose={onClose} title={title} onSave={handleSubmit}>
      <Form form={form} layout="vertical">
        <Form.Item name="id" label="ID" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="image" hidden>
          <Input></Input>
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu đề bước"
          required
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề bước." }]}
        >
          <Input placeholder="Nhập tiêu đề bước..." />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung"
          required
          rules={[{ required: true, message: "Vui lòng nhập nội dung bước." }]}
        >
          <TextArea rows={5} placeholder="Nhập nội dung mô tả..." />
        </Form.Item>

        <Form.Item label="Hình ảnh" name="image">
          <UploadImageBox maxSizeMB={10} />
        </Form.Item>
      </Form>
    </ModalShared>
  );
}
