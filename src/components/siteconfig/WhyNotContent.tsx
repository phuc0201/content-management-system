import { Typography } from "antd";
import { useMemo, useState } from "react";
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
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

type Reason = {
  id: string;
  title: string;
  description: string;
  index: number;
};

const normalize = (value?: string | null) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const mapReasons = (items: SiteConfigItem[]): Reason[] => {
  const whyNotType = normalize(SYSTEM_CONSTANT.SITE_CONFIG_TYPE.WHY_NOT);

  return items
    .filter((item) => normalize(item.type).includes(whyNotType))
    .sort((a, b) => a.index - b.index)
    .map((item) => ({
      id: item.id,
      title: item.title || "",
      description: item.content || item.text || "",
      index: item.index,
    }));
};

export default function WhyNotContent() {
  const { data: siteConfigItems = [], isFetching } =
    useGetAdminSiteConfigListQuery();
  const [createReason, { isLoading: isCreating }] =
    useCreateAdminSiteConfigMutation();
  const [updateReason, { isLoading: isUpdating }] =
    useUpdateAdminSiteConfigMutation();
  const [deleteReason, { isLoading: isDeleting }] =
    useDeleteAdminSiteConfigMutation();

  const reasons = useMemo(() => mapReasons(siteConfigItems), [siteConfigItems]);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const isSaving = isCreating || isUpdating || isDeleting;

  const addReason = async () => {
    const title = newTitle.trim();
    const description = newDescription.trim();

    if (!title || !description) {
      toast.warning("Vui lòng nhập đầy đủ tiêu đề và mô tả.");
      return;
    }

    if (reasons.length >= 3) {
      toast.warning("Tối đa 3 lý do.");
      return;
    }

    try {
      await createReason({
        type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.WHY_NOT,
        title,
        content: description,
        text: description,
        link: null,
        imgUrl: null,
        active: true,
        index: reasons.length + 1,
      }).unwrap();

      setNewTitle("");
      setNewDescription("");
      toast.success("Đã thêm lý do.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể thêm lý do.");
    }
  };

  const startEdit = (reason: Reason) => {
    setEditingId(reason.id);
    setEditingTitle(reason.title);
    setEditingDescription(reason.description);
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const title = editingTitle.trim();
    const description = editingDescription.trim();

    if (!title || !description) {
      toast.warning("Vui lòng nhập đầy đủ tiêu đề và mô tả.");
      return;
    }

    try {
      const current = reasons.find((reason) => reason.id === editingId);
      await updateReason({
        id: editingId,
        body: {
          title,
          content: description,
          text: description,
          active: true,
          index: current?.index ?? 1,
        },
      }).unwrap();

      setEditingId(null);
      setEditingTitle("");
      setEditingDescription("");
      toast.success("Đã cập nhật lý do.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật lý do.");
    }
  };

  const removeReason = async (reason: Reason) => {
    if (!confirm(`Xóa lý do "${reason.title}" ?`)) return;

    try {
      await deleteReason(reason.id).unwrap();
      toast.success("Đã xóa lý do.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa lý do.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Title level={4} className="mb-1!">
          Lý do chọn doanh nghiệp
        </Title>
        <Text type="secondary" className="text-sm">
          Quản lý nội dung các lí do khách hàng chọn chúng tôi (1-3 mục).
        </Text>
      </div>

      <div className="w-full">
        <section className="rounded-2xl border border-slate-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 shadow-sm">
          <div className="space-y-6">
            {reasons.map((reason, index) => (
              <div
                key={reason.id}
                className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-gray-700 dark:border-gray-700 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 dark:text-gray-200">
                    Reason {index + 1}
                  </p>
                  {editingId === reason.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} loading={isSaving}>
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditingTitle("");
                          setEditingDescription("");
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(reason)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void removeReason(reason)}
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-200">
                      Title
                    </label>
                    <Input
                      value={
                        editingId === reason.id ? editingTitle : reason.title
                      }
                      onChange={(e) => {
                        if (editingId === reason.id)
                          setEditingTitle(e.target.value);
                      }}
                      placeholder="Nhập tiêu đề..."
                      disabled={editingId !== reason.id}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-gray-200">
                      Description
                    </label>
                    <TextArea
                      value={
                        editingId === reason.id
                          ? editingDescription
                          : reason.description
                      }
                      onChange={(value) => {
                        if (editingId === reason.id)
                          setEditingDescription(value);
                      }}
                      placeholder="Nhập mô tả..."
                      disabled={editingId !== reason.id}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-dashed border-slate-300 dark:border-gray-600 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700 dark:text-gray-200">
                Thêm lý do mới
              </p>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
              />
              <TextArea
                value={newDescription}
                onChange={(value) => setNewDescription(value)}
                placeholder="Nhập mô tả..."
              />
              <div className="flex justify-end">
                <Button
                  onClick={addReason}
                  loading={isSaving}
                  disabled={isFetching || reasons.length >= 3}
                >
                  + Thêm lí do
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
