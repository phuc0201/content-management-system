import { Typography } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { PlusIcon } from "../../assets/icons";
import UploadImageBox from "../common/UpdloadImageBox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { ModalShared } from "../ui/modal";

const { Title, Text } = Typography;

type IconItem = {
  id: string;
  name: string;
  link: string;
  preview?: string;
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_ICONS: IconItem[] = [
  { id: "1", name: "Facebook", link: "https://facebook.com/example" },
  { id: "2", name: "Instagram", link: "https://instagram.com/example" },
  { id: "3", name: "Zalo", link: "https://zalo.me/example" },
];

// Giả lập gọi API: delay 600ms rồi trả về thành công
const fakeApiCall = () => new Promise<void>((resolve) => setTimeout(resolve, 600));
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactIcon() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Khởi tạo bằng mock data thay vì mảng rỗng
  const [icons, setIcons] = useState<IconItem[]>(MOCK_ICONS);
  const [editingId, setEditingId] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setLink("");
    setFile(null);
    setEditingId(null);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.warning("Vui lòng nhập tên icon.");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: thay fakeApiCall() bằng call API thực (POST / PUT)
      await fakeApiCall();

      if (editingId) {
        setIcons((prev) =>
          prev.map((it) =>
            it.id === editingId
              ? {
                  ...it,
                  name,
                  link,
                  preview: file ? URL.createObjectURL(file) : it.preview,
                }
              : it,
          ),
        );
        toast.success("Đã cập nhật icon.");
      } else {
        const id = String(Date.now());
        const preview = file ? URL.createObjectURL(file) : undefined;
        setIcons((prev) => [...prev, { id, name, link, preview }]);
        toast.success("Đã thêm icon.");
      }

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Đã có lỗi xảy ra.");
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(item: IconItem) {
    setEditingId(item.id);
    setName(item.name);
    setLink(item.link);
    setFile(null);
    setOpen(true);
  }

  function handleDelete(item: IconItem) {
    if (!confirm(`Xóa icon "${item.name}" ?`)) return;
    // TODO: gọi API DELETE ở đây trước khi cập nhật state
    setIcons((prev) => prev.filter((it) => it.id !== item.id));
    if (item.preview) URL.revokeObjectURL(item.preview);
    toast.info("Đã xóa icon.");
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-start justify-between w-full">
        <div>
          <Title level={4} className="mb-1">
            Quản lý Icon liên hệ
          </Title>
          <Text type="secondary" className="text-sm">
            Thêm, chỉnh sửa hoặc xóa các Icon liên hệ hiển thị trên Website.
          </Text>
        </div>

        <div className="ml-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            startIcon={<PlusIcon />}
          >
            Thêm Icon liên hệ
          </Button>
        </div>
      </div>

      <div className="w-full border-2 border-dashed rounded-lg min-h-56 p-4 dark:border-gray-700 flex items-center justify-center">
        {icons.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <img
                src="/public/images/empty-state-mail.png"
                alt="empty"
                className="mx-auto mb-3 h-12 w-12"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có icon liên hệ nào</p>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            {icons.map((it) => (
              <div
                key={it.id}
                className="bg-white dark:bg-gray-800 rounded-md p-3 flex flex-col items-center justify-between shadow-sm"
              >
                <div className="flex-1 flex flex-col items-center gap-2">
                  {it.preview ? (
                    <img src={it.preview} alt={it.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                      Icon
                    </div>
                  )}
                  <div className="text-sm font-medium mt-2 text-gray-800 dark:text-gray-100">
                    {it.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                    {it.link}
                  </div>
                </div>

                <div className="mt-3 w-full flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(it)}
                    className="flex-1"
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(it)}
                    className="flex-1"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalShared
        isOpen={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title={editingId ? "Chỉnh sửa Icon liên hệ" : "Thêm Icon liên hệ"}
        isSaving={isSaving}
        onSave={handleSave}
        modalButtonSize="md"
      >
        <div className="space-y-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tên Icon
            </label>
            <Input
              placeholder="Ví dụ: Facebook, Instagram..."
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Hình ảnh Icon
            </label>
            <div className="w-full">
              <UploadImageBox onChange={(f: File | null) => setFile(f)} maxSizeMB={2} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Đường link
            </label>
            <Input
              placeholder="Ví dụ: https://facebook.com/..."
              value={link}
              onChange={(e: any) => setLink(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </ModalShared>
    </div>
  );
}
