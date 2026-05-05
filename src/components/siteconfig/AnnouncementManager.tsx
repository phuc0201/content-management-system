import { CloseOutlined } from "@ant-design/icons";
import { Empty, Typography } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  useCreateSiteConfigMutation,
  useDeleteSiteConfigMutation,
  useUpdateSiteConfigMutation,
} from "../../services/siteConfig.service";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import Input from "../form/input/InputField";
import DeleteButton from "../table/DeleteButton";
import EditButton from "../table/EditButton";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

export default function AnnouncementManager({ topbar = [] }: { topbar: SiteConfigItem[] }) {
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [createSiteConfig, { isLoading: isCreating }] = useCreateSiteConfigMutation();
  const [updateSiteConfig, { isLoading: isUpdating }] = useUpdateSiteConfigMutation();
  const [deleteSiteConfig, { isLoading: isDeleting }] = useDeleteSiteConfigMutation();

  const addAnnouncement = async () => {
    const trimmed = newText.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập nội dung thông báo.");
      return;
    }

    try {
      await createSiteConfig({ type: "topbar", text: trimmed }).unwrap();
      toast.success("Thêm thông báo thành công.");
      setNewText("");
    } catch (error) {
      console.error("Thêm thông báo thất bại:", error);
      toast.error("Không thể thêm thông báo.");
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      await deleteSiteConfig({ id }).unwrap();
      toast.success("Xóa thông báo thành công.");
    } catch (error) {
      console.error("Xóa thông báo thất bại:", error);
      toast.error("Không thể xóa thông báo.");
    }
  };

  const startEdit = (a: SiteConfigItem) => {
    setEditingId(a.id);
    setEditText(a.text ?? "");
  };

  const saveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      toast.error("Nội dung thông báo không được để trống.");
      return;
    }

    try {
      await updateSiteConfig({
        id: editingId!,
        type: "topbar",
        text: trimmed,
      }).unwrap();
      toast.success("Cập nhật thông báo thành công.");
      cancelEdit();
    } catch (error) {
      console.error("Lưu chỉnh sửa thất bại:", error);
      toast.error("Không thể lưu thay đổi.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div>
      <div className="mb-4">
        <Title level={4} className="mb-1!">
          Quản lý thông báo đầu trang
        </Title>
        <Text type="secondary" className="text-sm">
          Thêm, chỉnh sửa hoặc xóa các thông báo hiển thị trên trang chủ.
        </Text>
      </div>

      <div
        className="mb-6 flex gap-2 items-center w-full"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void addAnnouncement();
          }
        }}
      >
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Nhập nội dung thông báo..."
          aria-label="Nội dung thông báo mới"
          className="w-full flex-1"
          disabled={isCreating}
        />
        <Button size="md" onClick={addAnnouncement} disabled={isCreating} loading={isCreating}>
          Thêm
        </Button>
      </div>

      <div className="">
        <Text className="text-xs font-semibold text-gray-500 uppercase">
          Danh sách ({topbar.length})
        </Text>

        <div className="mt-2">
          {topbar.length === 0 ? (
            <Empty description="Chưa có thông báo nào" />
          ) : (
            <ul className="flex flex-col gap-2">
              {topbar.map((item, idx) => (
                <li
                  key={item.id}
                  className="bg-white border border-[#e8e4dc] rounded-lg px-3.5 py-3 flex items-center gap-2.5 dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center">
                    {idx + 1}
                  </div>

                  <div
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (editingId === item.id && e.key === "Enter") {
                        e.preventDefault();
                        void saveEdit();
                      }
                    }}
                  >
                    {editingId === item.id ? (
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        aria-label={`Chỉnh sửa nội dung thông báo ${idx + 1}`}
                        disabled={isUpdating}
                      />
                    ) : (
                      <Text>{item.text}</Text>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <Button onClick={saveEdit} disabled={isUpdating} loading={isUpdating}>
                          Lưu
                        </Button>
                        <Button variant="outline" onClick={cancelEdit} disabled={isUpdating}>
                          <CloseOutlined /> Hủy
                        </Button>
                      </>
                    ) : (
                      <>
                        <EditButton
                          onClick={() => startEdit(item)}
                          disabled={!!editingId || isDeleting}
                        />
                        <DeleteButton
                          onClick={() => removeAnnouncement(item.id)}
                          disabled={!!editingId || isDeleting}
                        />
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
