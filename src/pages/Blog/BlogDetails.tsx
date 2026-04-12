import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import "ckeditor5/ckeditor5-content.css";
import { useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RichTextEditor from "../../components/common/RichTextEditor";
import UploadImageBox from "../../components/common/UpdloadImageBox";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { PATH } from "../../constants/path.constant";
import {
  useCreateBlogMutation,
  useGetBlogByIdQuery,
  useUpdateBlogMutation,
  useUploadBlogImageMutation,
} from "../../services/blog.service";

const { Title, Text } = Typography;

export default function BlogDetails() {
  const navigate = useNavigate();
  const [form] = useForm();
  const { id } = useParams();

  const blogId = id;
  const isCreateMode = !blogId;

  const { data: blogResult, isFetching: fetchingBlog } = useGetBlogByIdQuery(blogId!, {
    skip: isCreateMode,
  });

  const [createBlog, { isLoading: creating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();

  const [uploadBlogImage] = useUploadBlogImageMutation();

  const loading = fetchingBlog || creating || updating;

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { thumbnailUrl, ...payload } = values;

      if (isCreateMode) {
        const result = await createBlog(payload).unwrap();
        if (result?.data) {
          if (thumbnailUrl instanceof File) {
            uploadBlogImage({ id: result.data.id, file: thumbnailUrl }).unwrap();
          }
          navigate(PATH.BLOG_DETAIL.replace(":id", String(result?.data?.id)));
        }
        toast.success("Tạo bài viết thành công!");
      } else {
        await updateBlog({
          id: blogId,
          body: {
            ...payload,
            ...(thumbnailUrl === null ? { thumbnailUrl: null } : {}),
          },
        }).unwrap();

        if (thumbnailUrl instanceof File) {
          uploadBlogImage({ id: blogId!, file: thumbnailUrl }).unwrap();
        }
        toast.success("Cập nhật bài viết thành công!");
      }
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
        thumbnailUrl: thumbnailUrl ? import.meta.env.VITE_BASE_URL + thumbnailUrl : null,
      });
    }
  }, [blogResult, form]);

  return (
    <Form form={form} onFinish={handleSave} layout="vertical" className="select-none">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="mb-1!">
            {isCreateMode ? "Tạo bài viết" : "Chi tiết bài viết"}
          </Title>
          <Text type="secondary" className="text-sm">
            Cập nhật thông tin, mô tả và nội dung bài viết.
          </Text>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(PATH.BLOG)}>
            Quay lại
          </Button>

          <Button size="sm" variant="primary" type="submit" loading={loading}>
            {isCreateMode ? "Tạo mới" : "Cập nhật"}
          </Button>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 space-y-4">
        <Form.Item
          label="Tiêu đề"
          name="title"
          required
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài viết." }]}
        >
          <Input placeholder="Nhập tiêu đề bài viết" disabled={loading} />
        </Form.Item>

        <Form.Item
          label="Ảnh đại diện bài viết"
          name={"thumbnailUrl"}
          rules={[{ required: false, message: "Vui lòng thêm ảnh đại diện" }]}
        >
          <UploadImageBox />
        </Form.Item>

        <Form.Item
          label="Nội dung"
          name="content"
          required
          rules={[{ required: true, message: "Vui lòng nhập nội dung bài viết." }]}
        >
          <RichTextEditor />
        </Form.Item>
      </section>
    </Form>
  );
}
