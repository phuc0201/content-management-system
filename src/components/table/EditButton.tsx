import { MdEdit } from "react-icons/md";

interface EditButtonProps {
  onClick?: () => void;
}

export default function EditButton({ onClick }: EditButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xl w-10 h-10 rounded-md flex items-center justify-center text-gray-300 hover:bg-brand-400 dark:hover:bg-gray-700 bg-brand-500"
    >
      <MdEdit />
    </button>
  );
}
