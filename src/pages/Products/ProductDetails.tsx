import { Form, Spin, Switch, Typography } from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import "ckeditor5/ckeditor5.css";
import { lazy, Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import ProductUploadImgBox from "../../components/product/ProductUploadImgBox";
import Button from "../../components/ui/button/Button";
import SplitButton from "../../components/ui/button/SplitButton";
import { PATH } from "../../constants/path.constant";
import { useGetCategoriesQuery } from "../../services/category.service";
import { useGetProductByIdQuery, useUpdateProductMutation } from "../../services/product.service";
import type { CreateProductDTO } from "../../types/product.type";
const RichTextEditor = lazy(() => import("../../components/common/RichTextEditor"));

const { Title, Text } = Typography;

interface ProductFormTypes {
  name: string;
  description: string;
  price: Number;
  salePrice: Number;
  categoryId: string;
  summary: string;
  isDraft: boolean;
}

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = useForm<ProductFormTypes>();
  const descriptionValue = useWatch("description", form) ?? "";
  const hasHydratedForm = useRef(false);

  const productId = id ? Number(id) : null;
  const isCreateMode = !productId || Number.isNaN(productId);

  const { data: categoryResults } = useGetCategoriesQuery({});

  const {
    data: productResult,
    isLoading,
    isFetching: fetchingProduct,
  } = useGetProductByIdQuery(productId!, { skip: isCreateMode });

  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const categoryOptions = useMemo(
    () =>
      (categoryResults?.data || []).map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categoryResults],
  );

  const descriptionImageIds = useMemo(
    () =>
      (productResult?.data?.images || [])
        .filter((img) => img?.scope === "prod-desc")
        .map((img) => img?.id),
    [productResult?.data?.images],
  );

  useLayoutEffect(() => {
    if (!productResult?.data || isCreateMode || hasHydratedForm.current) return;
    const p = productResult.data;
    form.setFieldsValue({
      name: p.name ?? "",
      price: p.price ? Number(p.price) : "",
      salePrice: p.salePrice ? Number(p.salePrice) : "",
      categoryId: String(p.categoryId ?? ""),
      summary: p.summary ?? "",
      description: p.description ?? "",
    });
    hasHydratedForm.current = true;
  }, [form, isCreateMode, productResult?.data]);

  const buildPayload = (values: ProductFormTypes): CreateProductDTO => ({
    name: values.name.trim(),
    description: values.description,
    price: Number(values.price),
    salePrice: values.salePrice ? Number(values.salePrice) : null,
    categoryId: Number(values.categoryId),
    summary: values.summary,
    thumbnailUrl: null,
    isDraft: values.isDraft,
  });

  const handleSave = async (isPublished: boolean) => {
    try {
      const values = await form.validateFields();

      if (!isCreateMode) {
        await updateProduct({
          id: productId,
          body: buildPayload({ ...values, isDraft: !isPublished }),
        }).unwrap();
        toast.success("Đã cập nhật sản phẩm.");
      }
    } catch (error: any) {
      if (error?.status) {
        console.error(error);
        toast.error("Không thể lưu sản phẩm.");
      }
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {isLoading && (
        <div className="fixed inset-0 z-1000 w-screen h-screen flex items-center justify-center bg-white/20 dark:bg-black/40 backdrop-blur-xs pointer-events-auto">
          <Spin size="small" description="Đang tải thông tin..." />
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <Title level={4} className="mb-1!">
            {isCreateMode ? "Tạo sản phẩm" : "Chi tiết sản phẩm"}
          </Title>
          <Text type="secondary" className="text-sm">
            Cập nhật thông tin, mô tả và ảnh sản phẩm.
          </Text>
        </div>
        <div className="hidden md:grid md:w-auto md:grid-cols-2 md:gap-2 md:items-center md:justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(PATH.PRODUCT)}
            className="h-11 w-full rounded-xl font-semibold md:h-10 md:w-auto md:rounded-lg"
          >
            Quay lại
          </Button>
          <SplitButton
            loading={isLoading || updating}
            onSave={handleSave}
            isDraft={productResult?.data?.isDraft}
            fullWidth
            className="h-11 rounded-xl md:h-10 md:rounded-lg"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-4 backdrop-blur md:hidden dark:border-gray-700 dark:bg-gray-900/95 mb-0!">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(PATH.PRODUCT)}
            className="h-11 w-full rounded-xl font-semibold"
          >
            Quay lại
          </Button>
          <SplitButton
            loading={isLoading || updating}
            onSave={handleSave}
            isDraft={productResult?.data?.isDraft}
            fullWidth
            menuPlacement="top"
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <ComponentCard>
        <Form form={form} layout="vertical">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Form.Item name="isDraft" hidden>
                <Switch />
              </Form.Item>

              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm." }]}
              >
                <Input placeholder="Nhập tên sản phẩm" disabled={fetchingProduct} />
              </Form.Item>

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

              <Form.Item
                label="Tóm tắt"
                name="summary"
                style={{ margin: 0 }}
                className="product-summary-stretch flex-1"
              >
                <TextArea
                  placeholder="Nhập tóm tắt sản phẩm"
                  disabled={fetchingProduct}
                  className="h-full"
                />
              </Form.Item>
            </div>

            <ProductUploadImgBox
              productId={productResult?.data?.id}
              imageUrls={productResult?.data?.images?.filter((img) => img?.scope === "product")}
              thumbnailUrl={
                productResult?.data?.images?.find((img) => img?.scope === "prod-thumb") || undefined
              }
            />
          </section>

          <section className="mt-4">
            <Suspense fallback={<div>Đang tải mô tả......</div>}>
              <Form.Item label="Mô tả chi tiết" name="description">
                <RichTextEditor
                  value={descriptionValue}
                  imageIds={(descriptionImageIds as string[]) || []}
                  ownerId={productId!}
                  type="prod-desc"
                />
              </Form.Item>
            </Suspense>
          </section>
        </Form>
      </ComponentCard>
    </div>
  );
}
