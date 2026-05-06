import { Image, message, Space, Tooltip } from "antd";
import { useState } from "react";
import { MdOutlinePushPin } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CategorySelect from "../../components/product/CategorySelect";
import DeleteButton from "../../components/table/DeleteButton";
import EditButton from "../../components/table/EditButton";
import PublishToggle from "../../components/table/PublishToggle";
import TableShared from "../../components/table/TableShared";
import { config } from "../../config";
import { PATH } from "../../constants/path.constant";
import { useDebounce } from "../../hooks/useDebounce";
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
  // const [suppressNextRefetch, setSuppressNextRefetch] = useState(false);
  const [pinningId, setPinningId] = useState<number | null>(null);

  const [createProduct, { isLoading: isCreatingProduct }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateProductMutation();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [paginationState, setPaginationState] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);

  const {
    data: productResults,
    isLoading: productsLoading,
    isFetching: fetchingProducts,
  } = useGetProductsQuery({
    pagination: paginationState,
    ...(selectedCategory ? { filters: { categoryId: selectedCategory } } : {}),
    ...(debouncedSearch
      ? {
          filters: {
            ...(selectedCategory ? { categoryId: selectedCategory } : {}),
            q: debouncedSearch,
          },
        }
      : {}),
  } as any);

  const { data: categoryResults } = useGetCategoriesQuery({});

  const [removeProduct] = useRemoveProductMutation();

  // useEffect(() => {
  //   if (!fetchingProducts && suppressNextRefetch) {
  //     setSuppressNextRefetch(false);
  //   }
  // }, [fetchingProducts, suppressNextRefetch]);

  const columns = [
    {
      key: "pin",
      title: "",
      cellClassName: "w-10",
      align: "center" as const,
      render: (record: Product) => (
        <Tooltip
          placement="topLeft"
          title={
            record.pin
              ? "Xóa khỏi danh sách sản phẩm nổi bật"
              : "Thêm vào danh sách sản phẩm nổi bật"
          }
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePin(record);
            }}
            className={`p-2 rounded transition-all active:scale-80 ${
              record.pin
                ? "text-red-500 hover:text-red-600"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <MdOutlinePushPin
              size={20}
              className={`transition-transform duration-300 ${record.pin ? "rotate-45" : ""} ${
                pinningId === record.id ? "animate-pin-bounce" : ""
              }`}
            />
          </button>
        </Tooltip>
      ),
    },
    {
      key: "image",
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
          {record.salePrice?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}{" "}
          {!record.salePrice &&
            record.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          {record.salePrice && (
            <s className="text-gray-400">
              {record.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "—"}
            </s>
          )}
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
      // setSuppressNextRefetch(true);
    } catch (error) {
      console.error("toggle publish failed:", error);
      toast.error("Không thể thay đổi trạng thái hiển thị.");
    }
  };

  const handleTogglePin = async (product: Product) => {
    try {
      setPinningId(product.id);
      await updateProduct({
        id: product.id,
        body: { pin: !product.pin },
      }).unwrap();
      toast.success(product.pin ? "Bỏ ghim sản phẩm" : "Đã ghim sản phẩm thành công");
      // setSuppressNextRefetch(true);
      setTimeout(() => setPinningId(null), 500);
    } catch (error) {
      console.error("toggle pin failed:", error);
      toast.error("Không thể cập nhật trạng thái ghim.");
      setPinningId(null);
    }
  };

  return (
    <div className="select-none">
      <TableShared<Product>
        cardConfig={{
          pinKey: "pin",
          imageKey: "image",
          nameKey: "name",
          statusKey: "isDraft",
          actionsKey: "actions",
        }}
        dataSource={productResults?.data || []}
        rowKey={"id"}
        columns={columns}
        loading={productsLoading}
        fetching={fetchingProducts}
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
              }}
              className="min-w-40! w-full sm:w-auto"
            />
          </div>
        }
      />
    </div>
  );
}
