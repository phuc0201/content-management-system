import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useModal from "antd/es/modal/useModal";
import { CiEdit, CiTrash } from "react-icons/ci";
import { toast } from "react-toastify";
import { config } from "../../config";
import type { ManuProcessStep } from "../../types/manuProcess.type";

type Props = {
  step: ManuProcessStep;
  onEdit: (step: ManuProcessStep) => void;
  onDelete: (localId: string) => void;
  isOverlay?: boolean;
};

export default function ManuProcessStepItem({ step, onEdit, onDelete, isOverlay }: Props) {
  const [modal, contextHolder] = useModal();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id ?? step.title,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? undefined : transition,
  };

  const handleDelete = () => {
    modal.confirm({
      title: "Xác nhận xóa",
      centered: true,
      content: "Bạn có chắc chắn muốn xóa bước này ?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => {
        if (step?.id) onDelete(step.id);
        else toast.error("Không thể xóa bước này vì chưa có ID. Vui lòng thử lại sau khi đã lưu.");
      },
    });
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={[
        "flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4",
        isDragging ? "opacity-30 shadow-none" : "hover:shadow-md",
        isOverlay ? "shadow-2xl rotate-1 scale-[1.02] cursor-grabbing" : "",
      ].join(" ")}
    >
      <div
        {...(isOverlay ? {} : { ...attributes, ...listeners })}
        className="text-gray-400 cursor-grab active:cursor-grabbing text-xl select-none px-1 hover:text-gray-600"
      >
        ⠿
      </div>

      {step.imageId ? (
        <img
          loading="lazy"
          src={config.imageBaseUrl + step?.image?.url}
          alt="step"
          className="w-16 h-16 object-cover rounded-lg shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 shrink-0 flex items-center justify-center text-[10px] text-gray-500 px-1 text-center">
          Chưa có ảnh
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{step.title}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{step.content}</p>
      </div>

      {!isOverlay && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(step)}
            type="button"
            className="text-base p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <CiEdit className="text-xl" />
          </button>
          <button
            onClick={handleDelete}
            type="button"
            className="text-base p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <CiTrash className="text-xl" />
          </button>
        </div>
      )}

      {contextHolder}
    </div>
  );
}
