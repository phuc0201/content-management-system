import { Image, message, Space } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CategorySelect from "../../components/product/CategorySelect";
import DeleteButton from "../../components/table/DeleteButton";
import EditButton from "../../components/table/EditButton";
import PublishToggle from "../../components/table/PublishToggle";
import TableShared from "../../components/table/TableShared";
import { config } from "../../config";
import { PATH } from "../../constants/path.constant";
import { useGetCategoriesQuery } from "../../services/category.service";
import {
  useCreateProductMutation,
  useGetProductsQuery,
  useRemoveProductMutation,
  useUpdateProductMutation,
} from "../../services/product.service";
import type { Product } from "../../types/product.type";

export default function Products() {
  const navigate = useNavigate();
  const [suppressNextRefetch, setSuppressNextRefetch] = useState(false);

  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [paginationState, setPaginationState] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState("");

  const {
    data: productResults,
    isLoading: productsLoading,
    isFetching: fetchingProducts,
  } = useGetProductsQuery({
    pagination: paginationState,
  });

  const { data: categoryResults } = useGetCategoriesQuery({});

  const [removeProduct] = useRemoveProductMutation();

  useEffect(() => {
    if (!fetchingProducts && suppressNextRefetch) {
      setSuppressNextRefetch(false);
    }
  }, [fetchingProducts, suppressNextRefetch]);

  const columns = [
    {
      key: "Image",
      title: "Ảnh",
      render: (record: Product) => {
        const imageSrc = record?.thumbnailUrl ? config.imageBaseUrl + record?.thumbnailUrl : "";
        return <Image src={imageSrc || "https://placehold.co/50"} alt="" height={50} />;
      },
    },
    { key: "name", title: "Tên sản phẩm" },
    {
      key: "category",
      title: "Danh mục",
      render: (record: Product) => record.category?.name || "—",
    },
    {
      key: "Price",
      title: "Giá gốc",
      render: (record: Product) => (
        <div>
          {record.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}{" "}
          <s className="text-gray-400">
            {record.salePrice?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) ||
              "—"}
          </s>
        </div>
      ),
    },
    {
      key: "isDraft",
      title: "Trạng thái",
      render: (record: Product) => (
        <PublishToggle
          disabled={isUpdatingProduct}
          published={!record.isDraft}
          onChange={(published) => {
            handleTogglePublish(record, published);
          }}
        />
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      align: "center" as const,
      cellClassName: "w-auto sm:w-37.5!",
      cardFullWidth: true,
      render: (record: Product) => (
        <Space className="w-full">
          <EditButton
            onClick={() => {
              navigate(PATH.PRODUCT + `/${record.id}`);
            }}
          />
          <DeleteButton
            onClick={async () => {
              try {
                await removeProduct(record.id).unwrap();
                message.success(`Đã xóa sản phẩm ${record.name}`);
              } catch (error) {
                console.error(error);
                message.error("Không thể xóa sản phẩm.");
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const handleCreateProduct = async () => {
    try {
      const { data: newProduct } = await createProduct({}).unwrap();
      if (newProduct?.id) {
        navigate(PATH.PRODUCT + `/${newProduct.id}`);
      }
    } catch (error: any) {
      console.error(error);
      message.error("Không thể tạo sản phẩm.");
    }
  };

  const handleTogglePublish = async (product: Product, published: boolean) => {
    try {
      await updateProduct({ id: product.id, body: { isDraft: !published } }).unwrap();
      setSuppressNextRefetch(true);
    } catch (error) {
      console.error("toggle publish failed:", error);
      toast.error("Không thể thay đổi trạng thái hiển thị.");
    }
  };

  return (
    <div className="select-none">
      <TableShared<Product>
        dataSource={productResults?.data || []}
        rowKey={"id"}
        columns={columns}
        loading={productsLoading}
        fetching={fetchingProducts && !suppressNextRefetch}
        pagination={{
          current: paginationState.current,
          pageSize: paginationState.pageSize,
          totalPage: 1,
          totalItem: productResults?.meta?.pagination?.totalItems || 0,
          pageSizeOptions: [10, 20, 50],
          onChange: (page: number, pageSize: number) => {
            setPaginationState({
              current: page,
              pageSize,
            });
          },
        }}
        buttonAdd={{
          show: true,
          text: "Thêm",
          isLoading: isCreatingProduct,
          onAdd: () => handleCreateProduct(),
        }}
        search={{
          enableSearch: true,
          searchKey: "name",
          placeholder: "Tìm kiếm sản phẩm",
          searchValue,
          onSearch: (value: string) => {
            setSearchValue(value);
          },
        }}
        topRightComponent={
          <div className="md:p-0 p-4">
            <CategorySelect
              options={(categoryResults?.data ?? []).map((cat) => ({
                label: cat.name,
                value: String(cat.id),
              }))}
              placeholder="Chọn danh mục"
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                console.log(value);
              }}
              className="min-w-40! w-full sm:w-auto"
            />
          </div>
        }
      />
    </div>
  );
}
