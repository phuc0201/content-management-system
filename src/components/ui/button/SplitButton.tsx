import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiEdit3, FiUpload } from "react-icons/fi";

type SaveStatus = "draft" | "published";

interface SplitButtonProps {
  onSave: (isPublished: boolean) => void;
  loading?: boolean;
  isDraft?: boolean;
}

const options = [
  {
    status: "draft" as SaveStatus,
    label: "Lưu nháp",
    desc: "Chỉ admin thấy, chưa công khai",
    Icon: FiEdit3,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-50",
  },
  {
    status: "published" as SaveStatus,
    label: "Lưu & Đăng công khai",
    desc: "Hiển thị trên trang khách hàng",
    Icon: FiUpload,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
  },
];

export default function SplitButton({
  onSave,
  loading = false,
  isDraft = false,
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isPub = !isDraft;

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        disabled={loading}
        onClick={() => onSave(isPub)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-l-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isPub ? <FiUpload size={14} /> : <FiEdit3 size={14} />}
        {isPub ? "Lưu & Đăng" : "Lưu nháp"}
      </button>

      <div className="w-px bg-blue-400/50" />

      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center px-2.5 py-2 text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-72 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          {options.map(({ status, label, desc, Icon, iconColor, iconBg }) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                onSave(status === "published");
                setOpen(false);
              }}
              className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconBg}`}
              >
                <Icon size={14} className={iconColor} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-800">{label}</span>
                <span className="text-xs text-gray-400">{desc}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
