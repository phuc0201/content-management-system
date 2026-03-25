import TableShared from "../../components/table/TableShared";
import type { Product } from "../../types/product.type";
import Badge from "../../components/ui/badge/Badge";
import { useFetchProductsWithMockDataQuery } from "../../services/product.service";
import {
  ActionButtons,
  type ActionDescriptor,
  type ActionRegistry,
} from "../../components/table/ActionButton";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../constants/path.constant";
import { message } from "antd";

export default function Products() {
  const navigate = useNavigate();

  const { data: productResponse, isLoading: productsLoading } = useFetchProductsWithMockDataQuery({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const productActions: ActionDescriptor<Product>[] = [
    { key: "edit", label: "Sửa", confirm: false },
    {
      key: "delete",
      label: "Xóa",
      confirm: { title: "Xóa sản phẩm?", message: "Hành động này không thể hoàn tác." },
    },
  ];

  const productActionRegistry: ActionRegistry<Product> = {
    edit: ({ row }) => {
      navigate(`${PATH.PRODUCT}/${row.id}`);
    },
    delete: async ({ row }) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success(`Đã xóa sản phẩm ${row.name}`);
    },
  };

  const columns = [
    { key: "name", title: "Product" },
    { key: "stock", title: "Stock" },
    {
      key: "status",
      title: "Status",
      render: (row: Product) => (
        <Badge key={"status - " + row.id} color={row.status === "in_stock" ? "success" : "error"}>
          {row.status ? "In Stock" : "Out of Stock"}
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
      render: (row: Product) => (
        <ActionButtons<Product>
          record={row}
          actions={productActions}
          registry={productActionRegistry}
        />
      ),
    },
  ];

  return (
    <div className="select-none">
      <TableShared<Product>
        dataSource={productResponse?.data || []}
        rowKey={"id"}
        columns={columns}
        loading={productsLoading}
        pagination={{
          current: 1,
          totalPage: 2,
          totalItem: 20,
          pageSizeOptions: [10, 20, 50],
          onChange: (page: number, pageSize: number) => {
            console.log("page: ", page);
            console.log("pageSize: ", pageSize);
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
          searchValue: "",
          onSearch: (value: string) => {
            console.log("search value: ", value);
          },
        }}
      />
    </div>
  );
}
