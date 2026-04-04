import { Typography } from "antd";
import "ckeditor5/ckeditor5-content.css";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import RichTextEditor from "../../components/common/RichTextEditor";
import UploadImageBox from "../../components/common/UpdloadImageBox";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import {
  useCreateBlogMutation,
  useGetBlogsQuery,
  useRemoveBlogMutation,
  useUpdateBlogMutation,
} from "../../services/blog.service";
import { useUploadAdminFileMutation } from "../../services/upload.service";

const { Title, Text } = Typography;

export default function Blog() {
  const { data: blogs = [], isFetching } = useGetBlogsQuery();
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const [removeBlog, { isLoading: isDeleting }] = useRemoveBlogMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadAdminFileMutation();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrlDraft, setThumbnailUrlDraft] = useState("");

  const selectedBlog = useMemo(
    () => blogs.find((item) => Number(item.id) === Number(selectedId)),
    [blogs, selectedId],
  );

  const isSaving = isCreating || isUpdating || isDeleting || isUploading;

  const startCreate = () => {
    setSelectedId(null);
    setTitle("");
    setShortDescription("");
    setContent("");
    setThumbnailFile(null);
    setThumbnailUrlDraft("");
  };

  const startEdit = (id: number) => {
    const blog = blogs.find((item) => Number(item.id) === Number(id));
    if (!blog) return;

    setSelectedId(Number(blog.id));
    setTitle(String(blog.title || ""));
    setShortDescription(String(blog.shortDescription || ""));
    setContent(String(blog.content || ""));
    setThumbnailFile(null);
    setThumbnailUrlDraft(String(blog.thumbnailUrl || ""));
  };

  const handleSave = async () => {
    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!nextTitle || !nextContent) {
      toast.warning("Vui lòng nhập tiêu đề và nội dung bài viết.");
      return;
    }

    try {
      let finalThumbnailUrl =
        thumbnailUrlDraft || selectedBlog?.thumbnailUrl || null;

      if (thumbnailFile) {
        const uploaded = await uploadFile(thumbnailFile).unwrap();
        finalThumbnailUrl = String(uploaded.url || "");
      }

      if (selectedId) {
        await updateBlog({
          id: selectedId,
          body: {
            title: nextTitle,
            shortDescription: shortDescription.trim() || undefined,
            content: nextContent,
            thumbnailUrl: finalThumbnailUrl,
          },
        }).unwrap();

        toast.success("Đã cập nhật bài viết.");
      } else {
        const created = await createBlog({
          title: nextTitle,
          shortDescription: shortDescription.trim() || undefined,
          content: nextContent,
          thumbnailUrl: finalThumbnailUrl,
        }).unwrap();

        setSelectedId(Number(created.id));
        setThumbnailUrlDraft(
          String(created.thumbnailUrl || finalThumbnailUrl || ""),
        );
        setThumbnailFile(null);
        toast.success("Đã tạo bài viết.");
      }

      if (selectedId) {
        setThumbnailFile(null);
        setThumbnailUrlDraft(String(finalThumbnailUrl || ""));
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu bài viết.");
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) {
      toast.info("Vui lòng chọn bài viết để xóa.");
      return;
    }

    if (!confirm(`Xóa bài viết "${selectedBlog.title}"?`)) {
      return;
    }

    try {
      await removeBlog(Number(selectedBlog.id)).unwrap();
      startCreate();
      toast.success("Đã xóa bài viết.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa bài viết.");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="mb-1!">
            Quản lý Blog
          </Title>
          <Text type="secondary" className="text-sm">
            Tạo, chỉnh sửa và xóa bài viết blog.
          </Text>
        </div>
        <Button
          size="sm"
          variant="outline"
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
        {blogs.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chưa có bài viết nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {blogs.map((blog) => {
              const isSelected = Number(blog.id) === Number(selectedId);

              return (
                <button
                  key={String(blog.id)}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-brand-300"
                  }`}
                  onClick={() => startEdit(Number(blog.id))}
                  disabled={isSaving}
                >
                  {blog.thumbnailUrl ? (
                    <img
                      src={String(blog.thumbnailUrl)}
                      alt={String(blog.title || "")}
                      className="mb-2 h-16 w-full rounded object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : null}
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {String(blog.title || "")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {String(blog.shortDescription || "Không có mô tả ngắn")}
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
            placeholder="Nhập tiêu đề bài viết"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isFetching}
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
            Mô tả ngắn
          </p>
          <TextArea
            rows={3}
            placeholder="Nhập mô tả ngắn"
            value={shortDescription}
            onChange={setShortDescription}
            disabled={isFetching}
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
            Thumbnail
          </p>
          {thumbnailUrlDraft ? (
            <img
              src={thumbnailUrlDraft}
              alt="blog-thumbnail"
              className="mb-3 h-36 w-full rounded object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : null}
          <UploadImageBox onChange={setThumbnailFile} maxSizeMB={2} />
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
            Nội dung
          </p>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => void handleSave()}
            loading={isSaving}
          >
            {selectedId ? "Cập nhật" : "Tạo mới"}
          </Button>
          <Button
            size="sm"
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
