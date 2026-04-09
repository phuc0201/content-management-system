import { Checkbox } from "antd";
import { useState } from "react";
import Select from "../../components/form/Select";

interface CategorySelectProps {
  options: { label: string; value: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function CategorySelect({
  options,
  placeholder = "Chọn danh mục",
  value,
  onChange,
  className,
}: CategorySelectProps) {
  const [selected, setSelected] = useState<string | undefined>(value);

  const handleSelect = (val: string) => {
    const next = selected === val ? undefined : val;
    setSelected(next);
    onChange?.(next ?? "");
  };

  return (
    <>
      {/* ── Desktop (md+): Select bình thường ── */}
      <div className="hidden md:block">
        <Select
          options={options}
          placeholder={placeholder}
          value={value}
          onChange={(val: string) => onChange?.(val)}
          className={className}
        />
      </div>

      {/* ── Mobile / Tablet (< md): Danh sách inline, không cần click mở ── */}
      <div className="block md:hidden w-full">
        <p className="px-1 pb-2 text-sm font-semibold text-gray-800">{placeholder}</p>

        <ul className="divide-y divide-gray-100">
          {options.map((opt) => {
            const isChecked = selected === opt.value;
            return (
              <li
                key={opt.value}
                className="flex items-center justify-between py-3 px-1 cursor-pointer active:bg-gray-50"
                onClick={() => handleSelect(opt.value)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </div>

                <Checkbox
                  checked={isChecked}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleSelect(opt.value)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
