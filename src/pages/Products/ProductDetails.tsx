import { Typography } from "antd";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import RichTextEditor from "../../components/common/RichTextEditor";
import UploadImageBox from "../../components/common/UpdloadImageBox";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { PATH } from "../../constants/path.constant";
import { useGetAdminCategoriesQuery } from "../../services/category.service";
import {
  useCreateProductMutation,
  useGetProductByIdQuery,
  useUpdateProductMutation,
  useUploadAdminProductImageMutation,
} from "../../services/product.service";

const { Title, Text } = Typography;

type ProductFormState = {
  name: string;
  slug: string;
  price: string;
  salePrice: string;
  category: string;
  summary: string;
  description: string;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  price: "",
  salePrice: "",
  category: "",
  summary: "",
  description: "",
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

  const productId = id ? Number(id) : null;
  const isCreateMode = !productId || Number.isNaN(productId);

  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);

  const { data: categories = [] } = useGetAdminCategoriesQuery();

  const {
    data: product,
    isFetching: fetchingProduct,
    refetch,
  } = useGetProductByIdQuery(productId ?? "", {
    skip: isCreateMode,
  });

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [uploadGalleryImage, { isLoading: uploading }] =
    useUploadAdminProductImageMutation();

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories],
  );

  const setField = (key: keyof ProductFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const valueByKey = (key: keyof ProductFormState) => {
    if (form[key]) return form[key];
    if (!product || isCreateMode) return "";

    const fallbackMap: Record<keyof ProductFormState, string> = {
      name: String(product.name ?? ""),
      slug: String(product.slug ?? ""),
      price: String(product.price ?? ""),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      category: String(product.category ?? product.categoryId ?? ""),
      summary: String(product.summary ?? ""),
      description: String(product.description ?? ""),
    };

    return fallbackMap[key];
  };

  const handleSave = async () => {
    const name = valueByKey("name").trim();
    const price = valueByKey("price").trim();
    const category = valueByKey("category");

    if (!name || !price || !category) {
      toast.warning("Vui lòng nhập đủ tên, giá và danh mục.");
      return;
    }

    const payload = {
      name,
      slug: valueByKey("slug").trim() || slugify(name),
      description: valueByKey("description"),
      price: Number(price) || 0,
      salePrice: valueByKey("salePrice")
        ? Number(valueByKey("salePrice"))
        : null,
      category,
      summary: valueByKey("summary"),
      thumbnailUrl: null,
    };

    try {
      if (isCreateMode) {
        const created = await createProduct(payload).unwrap();
        toast.success("Đã tạo sản phẩm.");
        navigate(`${PATH.PRODUCT}/${created.id}`);
      } else {
        await updateProduct({ id: productId, body: payload }).unwrap();
        toast.success("Đã cập nhật sản phẩm.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu sản phẩm.");
    }
  };

  const handleUploadGallery = async () => {
    if (!galleryFile || isCreateMode) {
      toast.warning("Hãy lưu sản phẩm trước khi tải ảnh gallery.");
      return;
    }

    try {
      await uploadGalleryImage({ id: productId, file: galleryFile }).unwrap();
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
            Cập nhật thông tin, mô tả và gallery ảnh sản phẩm.
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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
              Tên sản phẩm
            </p>
            <Input
              value={valueByKey("name")}
              onChange={(e) => setField("name", e.target.value)}
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
              Slug
            </p>
            <Input
              value={valueByKey("slug")}
              onChange={(e) => setField("slug", e.target.value)}
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
              Danh mục
            </p>
            <Select
              key={`category-${valueByKey("category") || "empty"}`}
              options={categoryOptions}
              defaultValue={valueByKey("category")}
              placeholder="Chọn danh mục"
              onChange={(value) => setField("category", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                Giá gốc
              </p>
              <Input
                type="number"
                value={valueByKey("price")}
                onChange={(e) => setField("price", e.target.value)}
              />
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                Giá giảm
              </p>
              <Input
                type="number"
                value={valueByKey("salePrice")}
                onChange={(e) => setField("salePrice", e.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
              Tóm tắt
            </p>
            <TextArea
              value={valueByKey("summary")}
              onChange={(value) => setField("summary", value)}
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Gallery ảnh
          </p>
          <UploadImageBox
            onChange={(file) => setGalleryFile(file)}
            maxSizeMB={2}
          />
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => void handleUploadGallery()}
              loading={uploading}
              disabled={isCreateMode}
            >
              Tải ảnh gallery
            </Button>
          </div>

          {!isCreateMode && (product?.images?.length ?? 0) > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {product?.images?.map((image) => (
                <img
                  key={String(image.id)}
                  src={String(image.url)}
                  alt={String(image.id)}
                  className="w-full h-20 rounded-md object-cover border border-gray-200 dark:border-gray-700"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-3 text-sm text-gray-700 dark:text-gray-200">
          Mô tả chi tiết
        </p>
        <RichTextEditor
          value={valueByKey("description")}
          onChange={(value) => setField("description", value)}
        />
      </section>
    </div>
  );
}
