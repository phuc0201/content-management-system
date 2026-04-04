import { useGetManuProcessQuery } from "../../services/manuProcess.service";

export default function LandingManufacturingPage() {
  const { data } = useGetManuProcessQuery();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">
          {data?.title || "Quy trình sản xuất"}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {data?.intro || ""}
        </p>
      </section>

      <section className="space-y-3">
        {(data?.process || []).map((step) => (
          <div
            key={`step-${step.index}`}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
          >
            <p className="font-medium">
              Bước {step.index}: {step.title}
            </p>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
              {step.content}
            </p>
            {step.imgUrl ? (
              <img
                src={step.imgUrl}
                alt={step.title}
                className="mt-3 h-40 w-full rounded object-cover"
              />
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
