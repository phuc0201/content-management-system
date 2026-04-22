import { Form, Typography } from "antd";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { SiteConfigType } from "../../constants/siteConfig.constant";
import { useGoongSearchAddressQuery } from "../../services/goong.service";
import {
  useGetSiteConfigsQuery,
  useUpsertSiteConfigByTypeMutation,
} from "../../services/siteConfig.service";
import type { GoongGeocodeResult } from "../../types/goong.type";
import type { UpsertSiteConfigBody } from "../../types/siteConfig.type";

const MapComponent = lazy(() => import("../../components/common/Map"));

const { Title, Text } = Typography;

const defaultLocation: [number, number] = [10.850664000361634, 106.77191309664425];

const normalizeOptionalString = (value: unknown) => {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : undefined;
};

export default function Contact() {
  const [form] = Form.useForm();
  const { data: siteConfigResponse, isFetching: isFetchingSiteConfig } = useGetSiteConfigsQuery({});
  const [upsertSiteConfigByType, { isLoading: isUpsertingSiteConfig }] =
    useUpsertSiteConfigByTypeMutation();
  const [addressQuery, setAddressQuery] = useState("");
  const [debouncedAddressQuery, setDebouncedAddressQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>(defaultLocation);
  const [mapMode, setMapMode] = useState<"desktop" | "touch">("desktop");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const hasGoongApiKey = Boolean(import.meta.env.VITE_GOONG_API_KEY);
  const shouldSearch = hasGoongApiKey && debouncedAddressQuery.trim().length >= 3;

  const { data: addressSearchData, isFetching: isSearchingAddress } = useGoongSearchAddressQuery(
    {
      address: debouncedAddressQuery.trim(),
    },
    {
      skip: !shouldSearch,
    },
  );

  const suggestions = addressSearchData?.results ?? [];

  useEffect(() => {
    if (!siteConfigResponse?.data?.length) return;

    const configByType = Object.fromEntries(
      siteConfigResponse.data.map((item) => [item.type, item]),
    );

    const companyAddress = configByType[SiteConfigType.CompanyAddress]?.text ?? "";
    const companyLat = configByType[SiteConfigType.CompanyLat]?.text ?? "";
    const companyLng = configByType[SiteConfigType.CompanyLng]?.text ?? "";

    form.setFieldsValue({
      [SiteConfigType.CompanyName]: configByType[SiteConfigType.CompanyName]?.text ?? "",
      [SiteConfigType.CompanyAddress]: companyAddress,
      [SiteConfigType.CompanyTaxCode]: configByType[SiteConfigType.CompanyTaxCode]?.text ?? "",
      [SiteConfigType.CompanyPhoneNumber]:
        configByType[SiteConfigType.CompanyPhoneNumber]?.text ?? "",
      [SiteConfigType.CompanyEmail]: configByType[SiteConfigType.CompanyEmail]?.text ?? "",
      [SiteConfigType.CompanyLat]: companyLat,
      [SiteConfigType.CompanyLng]: companyLng,
    });

    const parsedLat = Number(companyLat);
    const parsedLng = Number(companyLng);

    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      setSelectedPosition([parsedLat, parsedLng]);
    }
  }, [form, siteConfigResponse]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedAddressQuery(addressQuery);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [addressQuery]);

  useEffect(() => {
    form.setFieldsValue({
      [SiteConfigType.CompanyLat]: String(selectedPosition[0]),
      [SiteConfigType.CompanyLng]: String(selectedPosition[1]),
    });
  }, [form, selectedPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!suggestionsRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, []);

  const handleSelectAddress = (result: GoongGeocodeResult) => {
    const nextPosition: [number, number] = [
      result.geometry.location.lat,
      result.geometry.location.lng,
    ];

    setAddressQuery(result.formatted_address);
    setDebouncedAddressQuery(result.formatted_address);
    setSelectedPosition(nextPosition);
    setShowSuggestions(false);

    form.setFieldsValue({
      [SiteConfigType.CompanyAddress]: result.formatted_address,
      [SiteConfigType.CompanyLat]: String(nextPosition[0]),
      [SiteConfigType.CompanyLng]: String(nextPosition[1]),
    });
  };

  const handleMapPositionChange = (position: [number, number]) => {
    setSelectedPosition(position);
  };

  const handleMapModeChange = (mode: "desktop" | "touch") => {
    setMapMode(mode);
  };

  const onSubmit = async (values: Record<string, unknown>) => {
    const upsertItems: Array<{ type: string; body: UpsertSiteConfigBody }> = [
      {
        type: SiteConfigType.CompanyName,
        body: {
          text: normalizeOptionalString(values[SiteConfigType.CompanyName]),
        },
      },
      {
        type: SiteConfigType.CompanyAddress,
        body: {
          text: normalizeOptionalString(values[SiteConfigType.CompanyAddress]),
        },
      },
      {
        type: SiteConfigType.CompanyTaxCode,
        body: {
          text: normalizeOptionalString(values[SiteConfigType.CompanyTaxCode]),
        },
      },
      {
        type: SiteConfigType.CompanyPhoneNumber,
        body: {
          text: normalizeOptionalString(values[SiteConfigType.CompanyPhoneNumber]),
        },
      },
      {
        type: SiteConfigType.CompanyEmail,
        body: {
          text: normalizeOptionalString(values[SiteConfigType.CompanyEmail]),
        },
      },
      {
        type: SiteConfigType.CompanyLat,
        body: {
          text: normalizeOptionalString(values[SiteConfigType.CompanyLat]),
        },
      },
      {
        type: SiteConfigType.CompanyLng,
        body: {
          text: normalizeOptionalString(values[SiteConfigType.CompanyLng]),
        },
      },
    ];

    try {
      const results = await Promise.allSettled(
        upsertItems.map((item) =>
          upsertSiteConfigByType({
            type: item.type,
            body: item.body,
          }).unwrap(),
        ),
      );

      const failed = results
        .map((result, index) => ({ result, type: upsertItems[index].type }))
        .filter((item) => item.result.status === "rejected");

      if (failed.length > 0) {
        failed.forEach((item) => {
          console.error(`upsert failed for type ${item.type}:`, item.result);
        });
        toast.error("Một số cấu hình liên hệ lưu thất bại. Vui lòng thử lại.");
        return;
      }

      toast.success("Lưu thông tin liên hệ thành công.");
    } catch (error) {
      console.error("submit site config failed:", error);
      toast.error("Lưu thông tin liên hệ thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item>
          <div className="flex items-start justify-between">
            <div>
              <Title level={4} className="mb-1!">
                Thông tin liên hệ
              </Title>
              <Text type="secondary" className="text-sm">
                Cập nhật thông tin liên hệ của công ty, bao gồm địa chỉ, số điện thoại, email và mã
                số thuế.
              </Text>
            </div>
            <Button
              type="submit"
              disabled={isFetchingSiteConfig}
              loading={isUpsertingSiteConfig || isFetchingSiteConfig}
            >
              Lưu thông tin
            </Button>
          </div>
        </Form.Item>

        <Form.Item
          label="Tên công ty"
          name={SiteConfigType.CompanyName}
          required
          rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
        >
          <Input placeholder="Nhập tên công ty" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ công ty"
          name={SiteConfigType.CompanyAddress}
          required
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ công ty" }]}
        >
          <Input placeholder="Nhập địa chỉ công ty" />
        </Form.Item>

        <Form.Item label="Mã số thuế" name={SiteConfigType.CompanyTaxCode}>
          <Input placeholder="Nhập mã số thuế" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name={SiteConfigType.CompanyPhoneNumber}
          required
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          label="Email công ty"
          name={SiteConfigType.CompanyEmail}
          required
          rules={[{ required: true, message: "Vui lòng nhập email công ty" }]}
        >
          <Input placeholder="Nhập email công ty" />
        </Form.Item>

        <Form.Item name={SiteConfigType.CompanyLat} hidden>
          <Input />
        </Form.Item>

        <Form.Item name={SiteConfigType.CompanyLng} hidden>
          <Input />
        </Form.Item>
      </Form>

      <div className="space-y-6 pt-5">
        <div>
          <Title level={4} className="mb-1!">
            Ghim bản đồ
          </Title>
          <Text type="secondary" className="text-sm">
            {mapMode === "touch"
              ? "Pin được cố định ở giữa bản đồ. Hãy kéo bản đồ để ghim lại vị trí trên mobile/tablet."
              : "Trên desktop, nhấn vào vị trí trên bản đồ để cập nhật tọa độ công ty."}
          </Text>
        </div>

        <div className="relative" ref={suggestionsRef}>
          <Input
            placeholder="Tìm kiếm địa chỉ..."
            value={addressQuery}
            onChange={(event) => {
              setAddressQuery(event.target.value);
              setShowSuggestions(true);
            }}
          />

          {showSuggestions && addressQuery.trim().length > 0 && (
            <div className="absolute z-100000 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {!hasGoongApiKey && (
                <p className="px-4 py-3 text-sm text-amber-600">
                  Chưa cấu hình VITE_GOONG_API_KEY, không thể tìm địa chỉ.
                </p>
              )}

              {hasGoongApiKey && addressQuery.trim().length < 3 && (
                <p className="px-4 py-3 text-sm text-gray-500">Nhập ít nhất 3 ký tự để tìm kiếm.</p>
              )}

              {hasGoongApiKey && shouldSearch && isSearchingAddress && (
                <p className="px-4 py-3 text-sm text-gray-500">Đang tìm địa chỉ...</p>
              )}

              {hasGoongApiKey &&
                shouldSearch &&
                !isSearchingAddress &&
                suggestions.length === 0 && (
                  <p className="px-4 py-3 text-sm text-gray-500">Không tìm thấy địa chỉ phù hợp.</p>
                )}

              {hasGoongApiKey &&
                suggestions.map((result) => (
                  <button
                    key={result.place_id}
                    type="button"
                    onClick={() => handleSelectAddress(result)}
                    className="block w-full border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 last:border-b-0"
                  >
                    {result.formatted_address}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="w-full h-150! min-h-150">
          <Suspense fallback={<div>Đang tải bản đồ</div>}>
            {
              <MapComponent
                center={selectedPosition}
                markerPosition={selectedPosition}
                onPositionChange={handleMapPositionChange}
                onInteractionModeChange={handleMapModeChange}
              />
            }
          </Suspense>
        </div>
      </div>
    </div>
  );
}
