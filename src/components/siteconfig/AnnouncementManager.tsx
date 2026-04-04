import { CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Empty, Typography } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { SYSTEM_CONSTANT } from "../../constants/system.constant";
import {
  useCreateAdminSiteConfigMutation,
  useDeleteAdminSiteConfigMutation,
  useGetAdminSiteConfigListQuery,
  useUpdateAdminSiteConfigMutation,
} from "../../services/siteConfig.service";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import Input from "../form/input/InputField";
import DeleteButton from "../table/DeleteButton";
import EditButton from "../table/EditButton";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

interface Announcement {
  id: string;
  text: string;
  index: number;
}

const normalize = (value?: string | null) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const mapAnnouncements = (items: SiteConfigItem[]): Announcement[] => {
  const topbarType = normalize(SYSTEM_CONSTANT.SITE_CONFIG_TYPE.TOPBAR);

  return items
    .filter((item) => normalize(item.type).includes(topbarType))
    .sort((a, b) => a.index - b.index)
    .map((item) => ({
      id: item.id,
      text: item.text || item.content || item.title || "",
      index: item.index,
    }));
};

export default function AnnouncementManager() {
  const { data: siteConfigItems = [], isFetching } =
    useGetAdminSiteConfigListQuery();
  const [createAnnouncement, { isLoading: isCreating }] =
    useCreateAdminSiteConfigMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] =
    useUpdateAdminSiteConfigMutation();
  const [deleteAnnouncement, { isLoading: isDeleting }] =
    useDeleteAdminSiteConfigMutation();

  const announcements = mapAnnouncements(siteConfigItems);

  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const isMutating = isCreating || isUpdating || isDeleting;

  const addAnnouncement = async () => {
    const trimmed = newText.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập nội dung thông báo.");
      return;
    }

    try {
      await createAnnouncement({
        type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.TOPBAR,
        title: null,
        content: trimmed,
        text: trimmed,
        link: null,
        imgUrl: null,
        active: true,
        index: announcements.length + 1,
      }).unwrap();

      setNewText("");
      toast.success("Đã thêm thông báo.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể thêm thông báo.");
    }
  };

  const removeAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id).unwrap();
      toast.success("Đã xóa thông báo.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa thông báo.");
    }
  };

  const startEdit = (a: Announcement) => {
    setEditingId(a.id);
    setEditText(a.text);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const trimmed = editText.trim();
    if (!trimmed) {
      toast.error("Nội dung không được để trống.");
      return;
    }

    try {
      const currentItem = announcements.find((item) => item.id === editingId);

      await updateAnnouncement({
        id: editingId,
        body: {
          content: trimmed,
          text: trimmed,
          active: true,
          index: currentItem?.index ?? 1,
        },
      }).unwrap();

      setEditingId(null);
      setEditText("");
      toast.success("Đã cập nhật thông báo.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật thông báo.");
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

      <div className="mb-6 flex gap-2 items-center w-full">
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Nhập nội dung thông báo..."
          aria-label="Nội dung thông báo mới"
          className="w-full flex-1"
        />
        <Button
          size="md"
          onClick={addAnnouncement}
          loading={isMutating}
          disabled={isFetching}
        >
          <PlusOutlined /> Thêm
        </Button>
      </div>

      <div className="">
        <Text className="text-xs font-semibold text-gray-500 uppercase">
          Danh sách ({announcements.length})
        </Text>

        <div className="mt-2">
          {announcements.length === 0 ? (
            <Empty description="Chưa có thông báo nào" />
          ) : (
            <ul className="flex flex-col gap-2">
              {announcements.map((item, idx) => (
                <li
                  key={item.id}
                  className="bg-white border border-[#e8e4dc] rounded-lg px-3.5 py-3 flex items-center gap-2.5 dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center">
                    {idx + 1}
                  </div>

                  <div className="flex-1">
                    {editingId === item.id ? (
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        aria-label={`Chỉnh sửa nội dung thông báo ${idx + 1}`}
                      />
                    ) : (
                      <Text>{item.text}</Text>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <Button onClick={saveEdit}>
                          <CheckOutlined /> Lưu
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={isMutating}
                        >
                          <CloseOutlined /> Hủy
                        </Button>
                      </>
                    ) : (
                      <>
                        <EditButton onClick={() => startEdit(item)} />
                        <DeleteButton
                          onClick={() => void removeAnnouncement(item.id)}
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
