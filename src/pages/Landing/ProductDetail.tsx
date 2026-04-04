import { useParams } from "react-router-dom";
import { useGetPublicProductByIdQuery } from "../../services/product.service";

export default function LandingProductDetailPage() {
  const { id } = useParams();
  const { data: product, isFetching } = useGetPublicProductByIdQuery(id || "", {
    skip: !id,
  });

  if (isFetching) return <p className="text-sm text-gray-500">Đang tải...</p>;
  if (!product)
    return <p className="text-sm text-gray-500">Không tìm thấy sản phẩm.</p>;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">{String(product.name || "")}</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {String(product.summary || "")}
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(product.images || []).map((img) => (
          <img
            key={String(img.id)}
            src={String(img.url)}
            alt={String(product.name || "")}
            className="h-28 w-full rounded object-cover border border-gray-200 dark:border-gray-800"
          />
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <p className="text-sm">Giá gốc: {String(product.price || "")}</p>
        <p className="text-sm">Giá giảm: {String(product.salePrice || "")}</p>
      </section>

      <section
        className="ck-content preview"
        dangerouslySetInnerHTML={{ __html: String(product.description || "") }}
      />
    </div>
  );
}
