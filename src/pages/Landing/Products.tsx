import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PATH } from "../../constants/path.constant";
import { useGetCategoriesQuery } from "../../services/category.service";
import { useGetPublicProductsByCategoryQuery } from "../../services/product.service";

export default function LandingProductsPage() {
  const { data: categories = [] } = useGetCategoriesQuery();
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const queryParams = useMemo(
    () => ({ cateId: activeCategoryId ?? undefined, offset: 0, limit: 100 }),
    [activeCategoryId],
  );

  const { data: products = [], isFetching } =
    useGetPublicProductsByCategoryQuery(queryParams);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Sản phẩm theo danh mục</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={`rounded-md border px-3 py-1 text-sm ${activeCategoryId === null ? "border-brand-500 text-brand-600" : "border-gray-200 dark:border-gray-700"}`}
            onClick={() => setActiveCategoryId(null)}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={String(category.id)}
              className={`rounded-md border px-3 py-1 text-sm ${activeCategoryId === Number(category.id) ? "border-brand-500 text-brand-600" : "border-gray-200 dark:border-gray-700"}`}
              onClick={() => setActiveCategoryId(Number(category.id))}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {isFetching ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">Không có sản phẩm.</p>
        ) : (
          products.map((item) => (
            <Link
              key={String(item.id)}
              to={`${PATH.LANDING_PRODUCTS}/${item.id}`}
              className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
            >
              <p className="font-medium">{String(item.name || "")}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {String(item.summary || "")}
              </p>
              <p className="mt-2 text-sm">Giá: {String(item.price || "")}</p>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
