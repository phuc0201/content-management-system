import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { ManuProcessStep } from "../../types/manuProcess.type";
import ManuProcessStepItem from "./ManuProcessStepItem";

interface ManuProcessStepListProps {
  steps: ManuProcessStep[];
  onEdit: (step: ManuProcessStep) => void;
  onDelete: (localId: string) => void;
  onReorder: (steps: ManuProcessStep[]) => void;
}

export default function ManuProcessStepList({
  steps,
  onEdit,
  onDelete,
  onReorder,
}: ManuProcessStepListProps) {
  const [activeStep, setActiveStep] = useState<ManuProcessStep | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // phải kéo 5px mới trigger — tránh click nhầm
    }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveStep(steps.find((s) => s.id === String(active.id)) ?? null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveStep(null);
    if (!over || active.id === over.id) return;

    const from = steps.findIndex((s) => s.id === String(active.id));
    const to = steps.findIndex((s) => s.id === String(over.id));
    if (from < 0 || to < 0) return;

    onReorder(arrayMove(steps, from, to));
  };

  const handleDragCancel = () => setActiveStep(null);

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={steps.map((s, idx) => s.id ?? idx)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {steps.map((step, idx) => (
              <ManuProcessStepItem
                key={step.id ?? idx}
                step={step}
                onEdit={onEdit}
                onDelete={onDelete}
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
          <p className="text-sm">Chưa có bước nào. Nhấn "Thêm bước" để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
