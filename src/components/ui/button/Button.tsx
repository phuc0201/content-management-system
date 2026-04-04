import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  loading = false,
}) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
  };

  const variantClasses = {
    primary: "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-brand-500 hover:text-brand-500 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  return (
    <button
      type={type}
      className={`relative inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-300 ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${disabled || loading ? "cursor-not-allowed opacity-50 pl-10" : ""}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 left-4 inline-flex items-center justify-center overflow-hidden delay-150 ${loading ? "max-w-5 opacity-100" : "max-w-0 opacity-0"}`}
      >
        <Spin indicator={<LoadingOutlined spin />} style={{ color: "#fff" }} size="small" />
      </span>

      {startIcon && !loading && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
