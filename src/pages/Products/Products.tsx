import { message, Space } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteButton from "../../components/table/DeleteButton";
import EditButton from "../../components/table/EditButton";
import TableShared from "../../components/table/TableShared";
import Badge from "../../components/ui/badge/Badge";
import { PATH } from "../../constants/path.constant";
import {
  useGetProductsQuery,
  useRemoveProductMutation,
} from "../../services/product.service";
import type { Product } from "../../types/product.type";

export default function Products() {
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState("");

  const { data: products = [], isLoading: productsLoading } =
    useGetProductsQuery({
      pagination: paginationState,
    });

  const filteredProducts = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((product) =>
      String(product.name || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [products, searchValue]);

  const [removeProduct, { isLoading: removingProduct }] =
    useRemoveProductMutation();

  const pageTotal = filteredProducts.length;

  const columns = [
    { key: "name", title: "Product" },
    { key: "stock", title: "Stock" },
    {
      key: "status",
      title: "Status",
      render: (row: Product) => (
        <Badge
          key={"status - " + row.id}
          color={row.status === "in_stock" ? "success" : "error"}
        >
          {row.status === "in_stock" ? "In Stock" : "Out of Stock"}
        </Badge>
      ),
    },
    {
      key: "price",
      title: "Price",
      render: (row: Product) => <div>{row.price}</div>,
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      cellClassName: "w-37.5!",
      render: (record: Product) => (
        <Space>
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
          text: "Thêm sản phẩm",
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
      />
    </div>
  );
}
