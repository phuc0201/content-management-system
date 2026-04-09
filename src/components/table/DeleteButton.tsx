import { ExclamationCircleOutlined } from "@ant-design/icons";
import useModal from "antd/es/modal/useModal";
import { CiTrash } from "react-icons/ci";

export default function DeleteButton({ onClick }: { onClick?: () => void }) {
  const [modal, contextHolder] = useModal();

  const handleDelete = () => {
    modal.confirm({
      title: "Xác nhận xóa",
      centered: true,
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn xóa ?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => onClick && onClick(),
    });
  };

  return (
    <>
      {contextHolder}
      <button
        type="button"
        onClick={handleDelete}
        className="text-xl w-10 h-10 rounded-md flex items-center justify-center text-red-500 dark:text-gray-400 dark:hover:bg-gray-700 border border-red-200"
      >
        <CiTrash />
      </button>
    </>
  );
}
