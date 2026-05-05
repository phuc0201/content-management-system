import { Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SiteConfigType } from "../../constants/siteConfig.constant";
import {
  useCreateSiteConfigMutation,
  useDeleteSiteConfigMutation,
  useUpdateSiteConfigMutation,
} from "../../services/siteConfig.service";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
const { Title, Text } = Typography;

export default function WhyNotContent({ reasons }: { reasons: SiteConfigItem[] }) {
  const [localReasons, setLocalReasons] = useState<SiteConfigItem[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  const [createSiteConfig, { isLoading: isCreating }] = useCreateSiteConfigMutation();
  const [updateSiteConfig, { isLoading: isUpdating }] = useUpdateSiteConfigMutation();
  const [deleteSiteConfig, { isLoading: isDeleting }] = useDeleteSiteConfigMutation();

  const isSaving = isCreating || isUpdating || isDeleting;

  const sortedReasons = useMemo(
    () => [...reasons].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
    [reasons],
  );

  useEffect(() => {
    setLocalReasons(sortedReasons);
    setPendingDeleteIds([]);
  }, [sortedReasons]);

  const handleReasonChange = (id: string, field: "title" | "content", value: string) => {
    setLocalReasons((prev) =>
      prev.map((reason) => (reason.id === id ? { ...reason, [field]: value } : reason)),
    );
  };

  const addReason = () => {
    if (localReasons.length >= 10) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setLocalReasons((prev) => [
      ...prev,
      {
        id: tempId,
        type: SiteConfigType.WhyNot,
        title: "",
        content: "",
        index: prev.length,
      },
    ]);
  };

  const removeReason = (id: string) => {
    if (localReasons.length <= 1) return;

    const isPersisted = !id.startsWith("temp-");
    if (isPersisted) {
      setPendingDeleteIds((prev) => [...new Set([...prev, id])]);
    }

    setLocalReasons((prev) => prev.filter((reason) => reason.id !== id));
  };

  const saveReasons = async () => {
    if (localReasons.length < 1 || localReasons.length > 10) {
      toast.error("Danh sách lý do phải từ 1 đến 10 mục.");
      return;
    }

    const hasEmpty = localReasons.some(
      (reason) => !reason.title?.trim() || !reason.content?.trim(),
    );

    if (hasEmpty) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và mô tả cho tất cả lý do.");
      return;
    }

    try {
      if (pendingDeleteIds.length > 0) {
        await Promise.all(pendingDeleteIds.map((id) => deleteSiteConfig({ id }).unwrap()));
      }

      const savedReasons = await Promise.all(
        localReasons.map(async (reason, index) => {
          const payload = {
            type: "whynot",
            title: reason.title?.trim(),
            content: reason.content?.trim(),
            index: index + 1,
          };

          if (reason.id.startsWith("temp-")) {
            return createSiteConfig(payload).unwrap();
          }

          return updateSiteConfig({ id: reason.id, ...payload }).unwrap();
        }),
      );

      setLocalReasons(savedReasons.sort((a, b) => (a.index ?? 0) - (b.index ?? 0)));
      setPendingDeleteIds([]);
      toast.success("Lưu nội dung thành công.");
    } catch (error) {
      console.error("Lưu lý do chọn doanh nghiệp thất bại:", error);
      toast.error("Không thể lưu nội dung. Vui lòng thử lại.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Title level={4} className="mb-1!">
          Lý do chọn doanh nghiệp
        </Title>
        <Text type="secondary" className="text-sm">
          Quản lý nội dung các lí do khách hàng chọn chúng tôi (1-10 mục).
        </Text>
      </div>

      <div className="w-full">
        <ComponentCard>
          <div className="space-y-6">
            {localReasons.map((reason, index) => (
              <div
                key={reason.id}
                className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-gray-700 dark:border-gray-700  p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 dark:text-gray-200">
                    Lý do {index + 1}
                  </p>
                  <button
                    onClick={() => removeReason(reason.id)}
                    disabled={localReasons.length === 1 || isSaving}
                    className="text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    Xóa
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Tiêu đề
                    </label>
                    <Input
                      value={reason.title || ""}
                      onChange={(e) => handleReasonChange(reason.id, "title", e.target.value)}
                      placeholder="Nhập tiêu đề..."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</label>
                    <TextArea
                      value={reason.content || ""}
                      onChange={(value) => handleReasonChange(reason.id, "content", value)}
                      placeholder="Nhập mô tả..."
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                onClick={addReason}
                disabled={localReasons.length === 10 || isSaving}
                type="button"
                className="flex-1 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
              >
                + Thêm lí do
              </button>
              <button
                onClick={() => void saveReasons()}
                disabled={isSaving}
                type="button"
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                {isSaving ? "Đang lưu..." : "Lưu nội dung"}
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
