import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import "ckeditor5/ckeditor5-content.css";
import { lazy, Suspense, useLayoutEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import UploadImageBox from "../../components/common/UpdloadImageBox";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import SplitButton from "../../components/ui/button/SplitButton";
import { config } from "../../config";
import { PATH } from "../../constants/path.constant";
import { useGetBlogByIdQuery, useUpdateBlogMutation } from "../../services/blog.service";
import { useUploadImageMutation } from "../../services/upload.service";
const RichTextEditor = lazy(() => import("../../components/common/RichTextEditor"));

const { Title, Text } = Typography;

export default function BlogDetails() {
  const navigate = useNavigate();
  const [form] = useForm();
  const { id } = useParams();

  const blogId = id;

  const { data: blogResult } = useGetBlogByIdQuery(blogId!);

  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();

  const [uploadImage] = useUploadImageMutation();

  const contentImageIds = useMemo(
    () =>
      (blogResult?.data?.images || [])
        .filter((img) => img?.scope === "prod-desc")
        .map((img) => img?.id),
    [blogResult?.data?.images],
  );

  const handleUploadThumbnail = async (file: File) => {
    try {
      if (!blogId) return;

      uploadImage({
        files: [file],
        type: "blog-thumb",
        id: blogId,
      }).unwrap();
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error("Đã có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.");
    }
  };

  const handleSave = async (isPublished: boolean) => {
    try {
      if (!blogId) return;

      const values = await form.validateFields();
      const { thumbnailUrl, ...payload } = values;
      if (
        thumbnailUrl &&
        thumbnailUrl !== blogResult?.data?.thumbnailUrl &&
        thumbnailUrl instanceof File
      ) {
        handleUploadThumbnail(thumbnailUrl);
      }

      await updateBlog({ id: blogId!, body: { ...payload, isDraft: !isPublished } }).unwrap();

      toast.success("Cập nhật bài viết thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  useLayoutEffect(() => {
    if (blogResult?.data) {
      const { thumbnailUrl, ...rest } = blogResult.data;
      form.setFieldsValue({
        ...rest,
        thumbnailUrl: thumbnailUrl ? config.imageBaseUrl + thumbnailUrl : null,
      });
    }
  }, [blogResult, form]);

  return (
    <Form form={form} onFinish={handleSave} layout="vertical" className="select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="mb-1!">
            Chỉnh sửa bài viết
          </Title>
          <Text type="secondary" className="text-sm">
            Cập nhật thông tin, mô tả và nội dung bài viết.
          </Text>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(PATH.BLOG)}>
            Quay lại
          </Button>
          <SplitButton onSave={handleSave} isDraft={!!blogResult?.data?.isDraft} />
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 space-y-4">
        <Form.Item
          label="Tiêu đề"
          name="title"
          required
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài viết." }]}
        >
          <Input placeholder="Nhập tiêu đề bài viết" disabled={updating} />
        </Form.Item>

        <Form.Item
          label="Ảnh đại diện bài viết"
          name={"thumbnailUrl"}
          rules={[{ required: false, message: "Vui lòng thêm ảnh đại diện" }]}
        >
          <UploadImageBox maxSizeMB={10} />
        </Form.Item>

        <Suspense fallback={<div>Đang tải editor...</div>}>
          <Form.Item
            label="Nội dung"
            name="content"
            required
            rules={[{ required: true, message: "Vui lòng nhập nội dung bài viết." }]}
          >
            <RichTextEditor
              type="blog"
              ownerId={blogId}
              imageIds={(contentImageIds as string[]) || []}
            />
          </Form.Item>
        </Suspense>
      </section>
    </Form>
  );
}
