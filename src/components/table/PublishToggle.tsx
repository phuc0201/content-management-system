import { FiEye, FiEyeOff } from "react-icons/fi";

const PublishToggle = ({
  published,
  disabled = false,
  onChange,
}: {
  published: boolean;
  disabled?: boolean;
  onChange: (published: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!published)}
    disabled={disabled}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap
      ${
        published
          ? "text-green-700 border-green-300 bg-green-50 hover:bg-green-100"
          : "text-orange-700 border-orange-300 bg-orange-50 hover:bg-orange-100"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
  >
    {published ? <FiEye size={12} /> : <FiEyeOff size={12} />}
    {published ? "Công khai" : "Bản nháp"}
  </button>
);

export default PublishToggle;
