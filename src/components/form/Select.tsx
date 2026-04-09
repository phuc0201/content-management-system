import { useEffect, useRef, useState } from "react";
import { MdCheck, MdKeyboardArrowDown } from "react-icons/md";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const controlled = value !== undefined;
  const currentValue = controlled ? value : selectedValue;
  const selectedLabel = options.find((o) => o.value === currentValue)?.label;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    if (!controlled) setSelectedValue(val);
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm 
          focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
          dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800
          ${currentValue ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"}
        `}
      >
        <span className="truncate">{selectedLabel ?? placeholder}</span>
        <MdKeyboardArrowDown
          className={`shrink-0 text-lg text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <ul
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white py-1
            dark:border-gray-700 dark:bg-gray-900"
        >
          {options.map((option) => {
            const isSelected = option.value === currentValue;
            return (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  ${
                    isSelected
                      ? "font-medium text-brand-500 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <MdCheck className="shrink-0 text-base text-brand-500 dark:text-brand-400" />
                )}
              </li>
            );
          })}

          {options.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">
              Không có lựa chọn nào
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Select;
