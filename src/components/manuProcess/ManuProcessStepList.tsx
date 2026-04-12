import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { createPortal } from "react-dom";
import ManuProcessStepItem from "./ManuProcessStepItem";

type Step = { id: string; title: string; content: string; image: string };

const initialSteps: Step[] = [
  {
    id: "1",
    title: "Bước 1: Cài đặt môi trường",
    content: "Cài Node.js, npm và khởi tạo project Vite + React.",
    image: "",
  },
  {
    id: "2",
    title: "Bước 2: Cài dnd-kit",
    content: "Chạy npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities.",
    image: "",
  },
  {
    id: "3",
    title: "Bước 3: Tạo component",
    content: "Tạo StepList, StepItem và StepModal theo hướng dẫn.",
    image: "",
  },
];

export default function ManuProcessStepList() {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [activeStep, setActiveStep] = useState<Step | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // phải kéo 5px mới trigger — tránh click nhầm
    }),
  );

  const handleDragStart = ({ active }: any) => {
    setActiveStep(steps.find((s) => s.id === active.id) ?? null);
  };

  const handleDragEnd = ({ active, over }: any) => {
    setActiveStep(null);
    if (!over || active.id === over.id) return;
    setSteps((prev) => {
      const from = prev.findIndex((s) => s.id === active.id);
      const to = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, from, to);
    });
  };

  const handleDragCancel = () => setActiveStep(null);

  const openAdd = () => {};
  const openEdit = (step: Step) => {};
  const handleDelete = (id: string) => setSteps((prev) => prev.filter((s) => s.id !== id));

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1">
            {steps.map((step, i) => (
              <ManuProcessStepItem
                key={step.id}
                step={step}
                index={i}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>

        {createPortal(
          <DragOverlay
            dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}
          >
            {activeStep && (
              <ManuProcessStepItem
                step={activeStep}
                index={steps.findIndex((s) => s.id === activeStep.id)}
                onEdit={() => {}}
                onDelete={() => {}}
                isOverlay
              />
            )}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>

      {steps.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">Chưa có step nào. Nhấn "+ Thêm Step" để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
