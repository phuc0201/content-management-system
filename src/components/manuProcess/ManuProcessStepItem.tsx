import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Step = { id: string; title: string; content: string; image: string };

type Props = {
  step: Step;
  index: number;
  onEdit: (step: Step) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
};

export default function ManuProcessStepItem({ step, index, onEdit, onDelete, isOverlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? undefined : transition, // overlay không cần transition
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={[
        "flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4",
        isDragging ? "opacity-30 shadow-none" : "hover:shadow-md", // item gốc mờ khi đang kéo
        isOverlay ? "shadow-2xl rotate-1 scale-[1.02] cursor-grabbing" : "", // ghost nổi lên
      ].join(" ")}
    >
      <div
        {...(isOverlay ? {} : { ...attributes, ...listeners })}
        className="text-gray-400 cursor-grab active:cursor-grabbing text-xl select-none px-1 hover:text-gray-600"
      >
        ⠿
      </div>

      {step.image && (
        <img src={step.image} alt="step" className="w-16 h-16 object-cover rounded-lg shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{step.title}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{step.content}</p>
      </div>

      {!isOverlay && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onEdit(step)}
            className="text-base p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(step.id)}
            className="text-base p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
