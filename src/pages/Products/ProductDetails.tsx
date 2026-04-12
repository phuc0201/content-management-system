import { Form, Typography } from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import { useLayoutEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RichTextEditor from "../../components/common/RichTextEditor";
import UploadImageBox from "../../components/common/UpdloadImageBox";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { PATH } from "../../constants/path.constant";
import { useGetCategoriesQuery } from "../../services/category.service";
import {
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateImageMutation,
  useUpdateProductMutation,
} from "../../services/product.service";

const { Title, Text } = Typography;

type ProductFormState = {
  name: string;
  slug: string;
  price: string;
  salePrice?: string;
  category: string;
  summary: string;
  description: string;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = useForm<ProductFormState>();
  const descriptionValue = useWatch("description", form) ?? "";

  const productId = id ? Number(id) : null;
  const isCreateMode = !productId || Number.isNaN(productId);

  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const { data: categoryResults } = useGetCategoriesQuery({});

  const {
    data: productResult,
    isFetching: fetchingProduct,
    refetch,
  } = useGetProductByIdQuery(productId!, { skip: isCreateMode });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [uploadGalleryImage, { isLoading: uploading }] = useUpdateImageMutation();

  const categoryOptions = useMemo(
    () =>
      (categoryResults?.data || []).map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categoryResults],
  );

  useLayoutEffect(() => {
    if (!productResult?.data || isCreateMode) return;
    const p = productResult.data;

    if (form) {
      form.setFieldsValue({
        name: p.name ?? "",
        slug: p.slug ?? "",
        price: p.price ? String(p.price) : "",
        salePrice: p.salePrice ? String(p.salePrice) : "",
        category: String(p.category ?? ""),
        summary: p.summary ?? "",
        description: p.description ?? "",
      });
    }
  }, [productResult]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        name: values.name.trim(),
        description: values.description,
        price: Number(values.price),
        salePrice: values.salePrice ? Number(values.salePrice) : null,
        categoryId: values.category,
        summary: values.summary,
        thumbnailUrl: null,
      };

      if (isCreateMode) {
        const { data: created } = await createProduct(payload).unwrap();
        toast.success("Đã tạo sản phẩm.");
        navigate(`${PATH.PRODUCT}/${created?.id}`);
      } else {
        await updateProduct({ id: productId, body: payload }).unwrap();
        toast.success("Đã cập nhật sản phẩm.");
      }
    } catch (error: any) {
      if (error?.status) {
        console.error(error);
        toast.error("Không thể lưu sản phẩm.");
      }
    }
  };

  const handleUploadGallery = async () => {
    if (!galleryFile || isCreateMode) {
      toast.warning("Hãy lưu sản phẩm trước khi tải ảnh gallery.");
      return;
    }
    try {
      await uploadGalleryImage({ id: productId, files: [galleryFile] }).unwrap();
      setGalleryFile(null);
      await refetch();
      toast.success("Đã tải ảnh vào gallery.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải ảnh gallery.");
    }
  };

  const loading = fetchingProduct || creating || updating;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="mb-1!">
            {isCreateMode ? "Tạo sản phẩm" : "Chi tiết sản phẩm"}
          </Title>
          <Text type="secondary" className="text-sm">
            Cập nhật thông tin, mô tả và ảnh sản phẩm.
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(PATH.PRODUCT)}>
            Quay lại
          </Button>
          <Button onClick={() => void handleSave()} loading={loading}>
            Lưu sản phẩm
          </Button>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm." }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            <Form.Item label="Slug" name="slug">
              <Input placeholder="de-khong-dau (tự tạo nếu để trống)" />
            </Form.Item>

            <Form.Item
              label="Danh mục"
              name="category"
              rules={[{ required: true, message: "Vui lòng chọn danh mục." }]}
            >
              <Select
                options={categoryOptions}
                placeholder="Chọn danh mục"
                onChange={(value) => form.setFieldValue("category", value)}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                label="Giá gốc"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá." }]}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>

              <Form.Item label="Giá giảm" name="salePrice">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </div>

            <Form.Item label="Tóm tắt" name="summary">
              <TextArea
                rows={4}
                placeholder="Nhập tóm tắt sản phẩm"
                onChange={(value) => form.setFieldValue("summary", value)}
              />
            </Form.Item>
          </div>

          <div className="flex flex-col gap-4 justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex-1 flex flex-col">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">Ảnh sản phẩm</p>
              <UploadImageBox onChange={(file) => setGalleryFile(file)} maxSizeMB={2} />
            </div>

            {/* {!isCreateMode && (productResult?.data?.images?.length ?? 0) > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {productResult?.data?.images?.map((image: ProductImage) => (
                  <img
                    key={String(image.id)}
                    src={import.meta.env.VITE_BASE_URL + String(image.url)}
                    alt={String(image.id)}
                    className="w-full h-20 rounded-md object-cover border border-gray-200 dark:border-gray-700"
                  />
                ))}
              </div>
            )} */}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 mt-4">
          <Form.Item label="Mô tả chi tiết" name="description">
            <RichTextEditor
              value={descriptionValue}
              onChange={(value) => form.setFieldValue("description", value)}
            />
          </Form.Item>
        </section>
      </Form>
    </div>
  );
}
