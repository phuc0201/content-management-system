import { message, Space } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategorySelect from "../../components/product/CategorySelect";
import DeleteButton from "../../components/table/DeleteButton";
import EditButton from "../../components/table/EditButton";
import TableShared from "../../components/table/TableShared";
import { PATH } from "../../constants/path.constant";
import { useGetCategoriesQuery } from "../../services/category.service";
import { useGetProductsQuery, useRemoveProductMutation } from "../../services/product.service";
import type { Product } from "../../types/product.type";

export default function Products() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [paginationState, setPaginationState] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState("");

  const { data: productResults, isLoading: productsLoading } = useGetProductsQuery({
    pagination: paginationState,
  });

  const { data: categoryResults } = useGetCategoriesQuery({});

  const filteredProducts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return productResults?.data || [];

    return (productResults?.data || []).filter((product) =>
      String(product.name || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [productResults, searchValue]);

  const [removeProduct, { isLoading: removingProduct }] = useRemoveProductMutation();

  const pageTotal = filteredProducts.length;

  const columns = [
    {
      key: "Image",
      title: "Ảnh",
      render: (record: Product) => {
        const firstImage = record?.images?.[0];
        const imageSrc =
          import.meta.env.VITE_BASE_URL +
          "/" +
          (typeof firstImage === "string" ? firstImage : (firstImage?.url ?? ""));

        return <img src={imageSrc} alt="" className="w-12.5 h-12.5 aspect-square object-cover" />;
      },
    },
    { key: "name", title: "Tên sản phẩm" },
    {
      key: "Price",
      title: "Giá gốc",
      render: (record: Product) => (
        <div>{record.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</div>
      ),
    },
    {
      key: "salePrice",
      title: "Giá khuyến mãi",
      render: (record: Product) => (
        <div>
          {record.salePrice
            ? record.salePrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
            : "—"}
        </div>
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

  return (
    <div className="select-none">
      <TableShared<Product>
        dataSource={filteredProducts}
        rowKey={"id"}
        columns={columns}
        loading={productsLoading || removingProduct}
        pagination={{
          current: paginationState.current,
          pageSize: paginationState.pageSize,
          totalPage: 1,
          totalItem: pageTotal,
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
          onAdd: () => {
            navigate(PATH.ADD_PRODUCT);
          },
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
