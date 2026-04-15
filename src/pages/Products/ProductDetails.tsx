import { Form, Spin, Typography } from "antd";
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
  useUpdateProductMutation,
} from "../../services/product.service";
import { useUploadImageMutation } from "../../services/upload.service";
import type { CreateProductDTO } from "../../types/product.type";

const { Title, Text } = Typography;

interface ProductFormTypes {
  name: string;
  description: string;
  price: Number;
  salePrice: Number;
  categoryId: string;
  summary: string;
}

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = useForm<ProductFormTypes>();
  const descriptionValue = useWatch("description", form) ?? "";

  const productId = id ? Number(id) : null;
  const isCreateMode = !productId || Number.isNaN(productId);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const { data: categoryResults } = useGetCategoriesQuery({});

  const {
    data: productResult,
    isLoading,
    isFetching: fetchingProduct,
    refetch,
  } = useGetProductByIdQuery(productId!, { skip: isCreateMode });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [uploadImage] = useUploadImageMutation();

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
        price: p.price ? Number(p.price) : "",
        salePrice: p.salePrice ? Number(p.salePrice) : "",
        categoryId: String(p.categoryId ?? ""),
        summary: p.summary ?? "",
        description: p.description ?? "",
      });
    }
  }, [productResult]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload: CreateProductDTO = {
        name: values.name.trim(),
        description: values.description,
        price: Number(values.price),
        salePrice: values.salePrice ? Number(values.salePrice) : null,
        categoryId: Number(values.categoryId),
        summary: values.summary,
        thumbnailUrl: null,
        img: [],
      };

      if (!isCreateMode) {
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

  const handleUploadGallery = async (file: File) => {
    if (isCreateMode) {
      toast.warning("Hãy lưu sản phẩm trước khi tải ảnh gallery.");
      return;
    }

    try {
      const { data: result } = await uploadImage({
        files: [file],
        id: productId!,
        type: "product",
      }).unwrap();

      setUploadedFile(file);
      console.log("Upload result:", result);
      toast.success("Đã tải ảnh vào gallery.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải ảnh gallery.");
    }
  };

  return (
    <div className="space-y-6">
      {fetchingProduct && (
        <div className="fixed top-0 left-0 right-0 -bottom-20 bg-gray-100/50 z-1000 flex items-center justify-center">
          <Spin spinning={fetchingProduct} size="large" />
        </div>
      )}
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
          <Button onClick={() => void handleSave()} loading={isLoading || updating || creating}>
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
              <Input placeholder="Nhập tên sản phẩm" disabled={fetchingProduct} />
            </Form.Item>

            {/* <Form.Item label="Slug" name="slug">
              <Input placeholder="de-khong-dau (tự tạo nếu để trống)" />
            </Form.Item> */}

            <Form.Item
              label="Danh mục"
              name="categoryId"
              rules={[{ required: true, message: "Vui lòng chọn danh mục." }]}
            >
              <Select
                options={categoryOptions}
                placeholder="Chọn danh mục"
                onChange={(value) => form.setFieldValue("categoryId", value)}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                label="Giá gốc"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá." }]}
              >
                <Input type="number" placeholder="0" disabled={fetchingProduct} />
              </Form.Item>

              <Form.Item label="Giá giảm" name="salePrice">
                <Input type="number" placeholder="0" disabled={fetchingProduct} />
              </Form.Item>
            </div>

            <Form.Item label="Tóm tắt" name="summary">
              <TextArea rows={4} placeholder="Nhập tóm tắt sản phẩm" disabled={fetchingProduct} />
            </Form.Item>
          </div>

          <div className="flex flex-col gap-4 justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex-1 flex flex-col">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">Ảnh sản phẩm</p>
              <UploadImageBox
                value={uploadedFile}
                onChange={(file) => handleUploadGallery(file as File)}
                maxSizeMB={2}
              />
            </div>
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
