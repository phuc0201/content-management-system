import { Space } from "antd";
import { useState } from "react";
import Input from "../../components/form/input/InputField";
import DeleteButton from "../../components/table/DeleteButton";
import EditButton from "../../components/table/EditButton";
import TableShared from "../../components/table/TableShared";
import { ModalShared } from "../../components/ui/modal";

import { toast } from "react-toastify";
import {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useRemoveCategoryMutation,
  useUpdateCategoryMutation,
} from "../../services/category.service";
import type { Category } from "../../types/category.type";

type CategoryFormState = {
  id: number | null;
  name: string;
};

const EMPTY_FORM: CategoryFormState = {
  id: null,
  name: "",
};

export default function CategoriesPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: categoryResults, isLoading } = useGetCategoriesQuery({
    pagination: {
      current: currentPage,
      pageSize: 10,
    },
  });
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useRemoveCategoryMutation();

  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);

  const isSaving = creating || updating;
  ``;

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setForm({
      id: category.id,
      name: category.name,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    const name = form.name.trim();

    if (!name) {
      toast.warning("Vui lòng nhập tên danh mục.");
      return;
    }

    try {
      if (form.id) {
        await updateCategory({
          id: form.id,
          body: { name },
        }).unwrap();
        toast.success("Đã cập nhật danh mục.");
      } else {
        await createCategory({ name }).unwrap();
        toast.success("Đã tạo danh mục.");
      }
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu danh mục.");
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategory(category.id).unwrap();
      toast.success("Đã xóa danh mục.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa danh mục.");
    }
  };

  const columns = [
    {
      key: "name",
      title: "Tên danh mục",
      render: (row: Category) => <span>{row.name}</span>,
    },
    {
      key: "actions",
      title: "Thao tác",
      align: "center" as const,
      cellClassName: "w-37.5!",
      render: (row: Category) => (
        <Space>
          <EditButton onClick={() => openEditModal(row)} />
          <DeleteButton onClick={() => void handleDelete(row)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <TableShared<Category>
        dataSource={categoryResults?.data || []}
        rowKey="id"
        columns={columns}
        loading={isLoading || deleting}
        buttonAdd={{
          show: true,
          text: "Thêm danh mục",
          onAdd: openCreateModal,
        }}
        search={{
          enableSearch: true,
          searchKey: "name",
          placeholder: "Tìm kiếm danh mục",
          searchValue,
          onSearch: (value) => setSearchValue(value),
        }}
        pagination={{
          current: currentPage,
          pageSize: categoryResults?.data?.length || 10,
          totalPage: 1,
          totalItem: categoryResults?.data?.length || 0,
          pageSizeOptions: [10, 20, 50],
          onChange: (page) => setCurrentPage(page),
        }}
      />

      <ModalShared
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={() => void handleSave()}
        title={form.id ? "Chỉnh sửa danh mục" : "Tạo danh mục"}
        isSaving={isSaving}
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-700 dark:text-gray-200">Tên danh mục</p>
          <Input
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            placeholder="Nhập tên danh mục"
          />
        </div>
      </ModalShared>
    </>
  );
}
