import { Link } from "react-router-dom";
import { PATH } from "../../constants/path.constant";
import { useGetPublicBlogsQuery } from "../../services/blog.service";

export default function LandingBlogsPage() {
  const { data: blogs = [], isFetching } = useGetPublicBlogsQuery();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Blog</h1>

      {isFetching ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blogs.map((blog) => (
            <Link
              key={String(blog.id)}
              to={`${PATH.LANDING_BLOGS}/${blog.id}`}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
            >
              {blog.thumbnailUrl ? (
                <img
                  src={String(blog.thumbnailUrl)}
                  alt={String(blog.title || "")}
                  className="mb-2 h-36 w-full rounded object-cover"
                />
              ) : null}
              <p className="font-medium">{String(blog.title || "")}</p>
              <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                {String(blog.shortDescription || "")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
