import { Space, message } from "antd";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteButton from "../../components/table/DeleteButton";
import EditButton from "../../components/table/EditButton";
import TableShared from "../../components/table/TableShared";
import { PATH } from "../../constants/path.constant";
import { useGetBlogsQuery, useRemoveBlogMutation } from "../../services/blog.service";
import type { Blog } from "../../types/blog.type";

export default function BlogList() {
  const navigate = useNavigate();
  const [paginationState, setPaginationState] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchValue, setSearchValue] = useState("");

  const { data: blogResults, isLoading: blogsLoading } = useGetBlogsQuery({
    pagination: paginationState,
  });

  const [removeBlog, { isLoading: removingBlog }] = useRemoveBlogMutation();

  const filteredBlogs = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return blogResults?.data || [];

    return (blogResults?.data || []).filter((blog) =>
      String(blog.title || "")
        .toLowerCase()
        .includes(keyword),
    );
  }, [blogResults, searchValue]);

  const pageTotal = filteredBlogs.length;

  const columns = [
    {
      key: "thumbnail",
      title: "Ảnh đại diện bài viết",
      render: (record: Blog) =>
        record.thumbnailUrl ? (
          <img
            src={String(import.meta.env.VITE_BASE_URL + record.thumbnailUrl)}
            alt={String(record.title || "")}
            className="h-12.5 aspect-video rounded object-cover"
          />
        ) : (
          <span>—</span>
        ),
    },
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
      render: (record: Blog) => (
        <Space className="w-full">
          <EditButton
            onClick={() => {
              navigate(PATH.BLOG + `/${record.id}`);
            }}
          />
          <DeleteButton
            onClick={async () => {
              try {
                await removeBlog(record.id).unwrap();
                message.success(`Đã xóa bài viết ${record.title}`);
              } catch (error) {
                console.error(error);
                message.error("Không thể xóa bài viết.");
              }
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="select-none h-full">
      <TableShared<Blog>
        dataSource={filteredBlogs}
        rowKey={"id"}
        columns={columns}
        loading={blogsLoading || removingBlog}
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
            navigate(PATH.BLOG + "/create");
          },
        }}
        search={{
          enableSearch: true,
          searchKey: "title",
          placeholder: "Tìm kiếm bài viết",
          searchValue,
          onSearch: (value: string) => {
            setSearchValue(value);
          },
        }}
      />
    </div>
  );
}
