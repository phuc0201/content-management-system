import { useParams } from "react-router-dom";
import { useGetPublicBlogByIdQuery } from "../../services/blog.service";

export default function LandingBlogDetailPage() {
  const { id } = useParams();
  const { data: blog, isFetching } = useGetPublicBlogByIdQuery(id || "", {
    skip: !id,
  });

  if (isFetching) return <p className="text-sm text-gray-500">Đang tải...</p>;
  if (!blog)
    return <p className="text-sm text-gray-500">Không tìm thấy bài viết.</p>;

  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{String(blog.title || "")}</h1>
      </header>

      {blog.thumbnailUrl ? (
        <img
          src={String(blog.thumbnailUrl)}
          alt={String(blog.title || "")}
          className="w-full h-56 rounded object-cover border border-gray-200 dark:border-gray-800"
        />
      ) : null}

      <section
        className="ck-content preview"
        dangerouslySetInnerHTML={{ __html: String(blog.content || "") }}
      />
    </article>
  );
}
