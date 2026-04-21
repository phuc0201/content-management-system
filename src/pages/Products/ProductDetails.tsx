import { Form, Switch, Typography } from "antd";
import { useForm, useWatch } from "antd/es/form/Form";
import "ckeditor5/ckeditor5.css";
import { useLayoutEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import RichTextEditor from "../../components/common/RichTextEditor";
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
          <SplitButton
            loading={isLoading || updating}
            onSave={handleSave}
            isDraft={productResult?.data?.isDraft}
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
            />
          </section>

          <section className="mt-4">
            <Form.Item label="Mô tả chi tiết" name="description">
              <RichTextEditor
                value={descriptionValue}
                imageIds={(descriptionImageIds as string[]) || []}
                ownerId={productId!}
                type="prod-desc"
              />
            </Form.Item>
          </section>
        </Form>
      </ComponentCard>
    </div>
  );
}
