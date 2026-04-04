import { Link } from "react-router-dom";
import { PATH } from "../../constants/path.constant";
import { useGetAboutsQuery } from "../../services/about.service";
import { useGetPublicBlogsQuery } from "../../services/blog.service";
import { useGetPopularProductsQuery } from "../../services/product.service";
import { useGetConfigQuery } from "../../services/siteConfig.service";

export default function LandingHomePage() {
  const { data: config } = useGetConfigQuery();
  const { data: about } = useGetAboutsQuery();
  const { data: popularProducts = [] } = useGetPopularProductsQuery({
    limit: 6,
  });
  const { data: blogs = [] } = useGetPublicBlogsQuery();

  const homeHero = config?.heroSection?.home;

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <h1 className="text-2xl font-semibold">
          {homeHero?.title || "MediBioTech"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {homeHero?.content || about?.intro || "Giới thiệu công ty"}
        </p>
        {homeHero?.imgUrl ? (
          <img
            src={homeHero.imgUrl}
            alt="hero-home"
            className="mt-4 h-56 w-full rounded-lg object-cover border border-gray-200 dark:border-gray-800"
          />
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sản phẩm nổi bật</h2>
          <Link className="text-sm text-brand-500" to={PATH.LANDING_PRODUCTS}>
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {popularProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có sản phẩm nổi bật.</p>
          ) : (
            popularProducts.map((item) => (
              <Link
                key={String(item.id)}
                to={`${PATH.LANDING_PRODUCTS}/${item.id}`}
                className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
              >
                <p className="font-medium">{String(item.name || "")}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {String(item.price || "")}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tin tức</h2>
          <Link className="text-sm text-brand-500" to={PATH.LANDING_BLOGS}>
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blogs.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có bài viết.</p>
          ) : (
            blogs.slice(0, 4).map((blog) => (
              <Link
                key={String(blog.id)}
                to={`${PATH.LANDING_BLOGS}/${blog.id}`}
                className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
              >
                <p className="font-medium">{String(blog.title || "")}</p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
