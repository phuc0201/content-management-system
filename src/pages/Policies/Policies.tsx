import { Space } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteButton from "../../components/table/DeleteButton";
import EditButton from "../../components/table/EditButton";
import TableShared from "../../components/table/TableShared";
import { PATH } from "../../constants/path.constant";
import { useCreatePolicyMutation, useGetPoliciesQuery } from "../../services/policy.service";
import type { Policy } from "../../types/policy.type";

export default function Policies() {
  const [searchValue, setSearchValue] = useState("");
  const naviage = useNavigate();

  const { data: policieRes } = useGetPoliciesQuery({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const [createPolicy, { isLoading: isCreating }] = useCreatePolicyMutation();

  const handleCreate = async () => {
    try {
      const { data: newPolicy } = await createPolicy({
        title: "Chính sách mới",
        content: "",
      });

      naviage(`${PATH.POLICY}/${newPolicy?.data?.id}`);
    } catch (error) {
      console.error("Lỗi khi tạo chính sách:", error);
    }
  };

  const columns = [
    {
      key: "title",
      title: "Tiêu đề",
    },
    {
      key: "actions",
      title: "Thao tác",
      align: "center" as const,
      cellClassName: "w-auto sm:w-37.5!",
      cardFullWidth: true,
      render: (record: Policy) => (
        <Space className="w-full">
          <EditButton
            onClick={() => {
              naviage(`${PATH.POLICY}/${record.id}`);
            }}
          />
          <DeleteButton onClick={async () => {}} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <TableShared<Policy>
        dataSource={policieRes?.data || []}
        rowKey={"id"}
        columns={columns}
        buttonAdd={{
          text: "Thêm",
          show: true,
          isLoading: isCreating,
          onAdd: handleCreate,
        }}
        search={{
          enableSearch: true,
          searchKey: "name",
          placeholder: "Tìm kiếm chính sách",
          searchValue,
          onSearch: (value: string) => {
            setSearchValue(value);
          },
        }}
      />
    </>
  );
}
