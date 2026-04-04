import { Typography } from "antd";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import RichTextEditor from "../../components/common/RichTextEditor";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import {
  useCreateAdminPolicyMutation,
  useDeleteAdminPolicyMutation,
  useGetAdminPoliciesQuery,
  useUpdateAdminPolicyMutation,
} from "../../services/policy.service";

const { Title, Text } = Typography;

export default function PoliciesPage() {
  const { data: policies = [], isFetching } = useGetAdminPoliciesQuery();
  const [createPolicy, { isLoading: isCreating }] =
    useCreateAdminPolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] =
    useUpdateAdminPolicyMutation();
  const [deletePolicy, { isLoading: isDeleting }] =
    useDeleteAdminPolicyMutation();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const selectedPolicy = useMemo(
    () => policies.find((item) => Number(item.id) === Number(selectedId)),
    [policies, selectedId],
  );

  const isSaving = isCreating || isUpdating || isDeleting;

  const startCreate = () => {
    setSelectedId(null);
    setTitle("");
    setContent("");
  };

  const startEdit = (id: number) => {
    const policy = policies.find((item) => Number(item.id) === Number(id));
    if (!policy) return;

    setSelectedId(Number(policy.id));
    setTitle(String(policy.title || ""));
    setContent(String(policy.content || ""));
  };

  const handleSave = async () => {
    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!nextTitle || !nextContent) {
      toast.warning("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }

    try {
      if (selectedId) {
        await updatePolicy({
          id: selectedId,
          body: {
            title: nextTitle,
            content: nextContent,
          },
        }).unwrap();
        toast.success("Đã cập nhật bài viết.");
      } else {
        const created = await createPolicy({
          title: nextTitle,
          content: nextContent,
        }).unwrap();
        setSelectedId(Number(created.id));
        toast.success("Đã tạo bài viết.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu bài viết.");
    }
  };

  const handleDelete = async () => {
    if (!selectedPolicy) {
      toast.info("Vui lòng chọn bài viết để xóa.");
      return;
    }

    if (!confirm(`Xóa bài viết "${selectedPolicy.title}"?`)) return;

    try {
      await deletePolicy(Number(selectedPolicy.id)).unwrap();
      startCreate();
      toast.success("Đã xóa bài viết.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa bài viết.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="mb-1!">
            Policies & partnerships
          </Title>
          <Text type="secondary" className="text-sm">
            Quản lý bài viết chính sách và đối tác.
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startCreate}
          disabled={isFetching || isSaving}
        >
          Tạo bài mới
        </Button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-3 text-sm text-gray-700 dark:text-gray-200">
          Danh sách bài viết
        </p>
        {policies.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chưa có bài viết nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {policies.map((policy) => {
              const isSelected = Number(policy.id) === Number(selectedId);

              return (
                <button
                  key={String(policy.id)}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-brand-300"
                  }`}
                  onClick={() => startEdit(Number(policy.id))}
                  disabled={isSaving}
                >
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {String(policy.title || "")}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 space-y-4">
        <div>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
            Tiêu đề
          </p>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Nhập tiêu đề"
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
            Nội dung
          </p>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={() => void handleSave()} loading={isSaving}>
            {selectedId ? "Cập nhật" : "Tạo mới"}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleDelete()}
            disabled={!selectedId || isSaving}
          >
            Xóa
          </Button>
        </div>
      </section>
    </div>
  );
}
