import { Col, ColorPicker, Row, Typography } from "antd";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SYSTEM_CONSTANT } from "../../constants/system.constant";
import {
  useCreateAdminSiteConfigMutation,
  useGetAdminSiteConfigListQuery,
  useUpdateAdminSiteConfigMutation,
  useUploadAdminSiteConfigImageMutation,
} from "../../services/siteConfig.service";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import UploadImageBox from "../common/UpdloadImageBox";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

interface BrandIdentityFormValues {
  logoDesktop: File | null;
  logoMobile: File | null;
  favicon: File | null;
}

interface FieldConfig {
  name: keyof BrandIdentityFormValues;
  type: string;
  index: number;
  label: string;
  description: string;
  recommendedSize: string;
  maxSizeMB: number;
}

const FIELDS: FieldConfig[] = [
  {
    name: "logoDesktop",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.MAIN_LOGO,
    index: 1,
    label: "Logo chính",
    description: "Hiển thị trên header desktop, email, tài liệu in ấn.",
    recommendedSize: "400 × 120 px",
    maxSizeMB: 2,
  },
  {
    name: "logoMobile",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.SUB_LOGO,
    index: 2,
    label: "Logo mobile",
    description: "Hiển thị trên thiết bị di động, thường là dạng icon vuông.",
    recommendedSize: "120 × 120 px",
    maxSizeMB: 1,
  },
  {
    name: "favicon",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.FAVICON,
    index: 3,
    label: "Favicon",
    description: "Icon hiển thị trên tab trình duyệt.",
    recommendedSize: "32 × 32 px",
    maxSizeMB: 0.5,
  },
];

const normalize = (value?: string | null) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const findByType = (items: SiteConfigItem[], type: string) => {
  const normalizedType = normalize(type);
  return items.find((item) => normalize(item.type).includes(normalizedType));
};

const BrandIdentitySettings: React.FC = () => {
  const { data: siteConfigItems = [], isFetching } =
    useGetAdminSiteConfigListQuery();
  const [createSiteConfig, { isLoading: isCreating }] =
    useCreateAdminSiteConfigMutation();
  const [updateSiteConfig, { isLoading: isUpdating }] =
    useUpdateAdminSiteConfigMutation();
  const [uploadSiteConfigImage, { isLoading: isUploading }] =
    useUploadAdminSiteConfigImageMutation();

  const [files, setFiles] = useState<BrandIdentityFormValues>({
    logoDesktop: null,
    logoMobile: null,
    favicon: null,
  });
  const [primaryColorDraft, setPrimaryColorDraft] = useState("");

  const fieldItems = useMemo(
    () =>
      FIELDS.map((field) => ({
        field,
        item: findByType(siteConfigItems, field.type),
      })),
    [siteConfigItems],
  );

  const primaryColorItem = useMemo(
    () =>
      findByType(
        siteConfigItems,
        SYSTEM_CONSTANT.SITE_CONFIG_TYPE.PRIMARY_COLOR,
      ),
    [siteConfigItems],
  );

  const currentPrimaryColor =
    primaryColorItem?.content || primaryColorItem?.text || "";
  const displayPrimaryColor =
    primaryColorDraft || currentPrimaryColor || "#1677ff";
  const isSaving = isCreating || isUpdating || isUploading;

  const handleSave = async () => {
    const hasFileChanges = Object.values(files).some((file) => Boolean(file));
    const hasColorChange = primaryColorDraft.trim().length > 0;

    if (!hasFileChanges && !hasColorChange) {
      toast.info("Không có thay đổi để lưu.");
      return;
    }

    try {
      for (const { field, item } of fieldItems) {
        const selectedFile = files[field.name];
        if (!selectedFile) continue;

        let itemId = item?.id;
        if (!itemId) {
          const created = await createSiteConfig({
            type: field.type,
            title: field.label,
            content: null,
            text: null,
            link: null,
            imgUrl: null,
            active: true,
            index: field.index,
          }).unwrap();

          itemId = created.id;
        } else {
          await updateSiteConfig({
            id: itemId,
            body: {
              title: field.label,
              active: true,
              index: field.index,
            },
          }).unwrap();
        }

        await uploadSiteConfigImage({
          id: itemId,
          file: selectedFile,
        }).unwrap();
      }

      if (hasColorChange) {
        if (primaryColorItem?.id) {
          await updateSiteConfig({
            id: primaryColorItem.id,
            body: {
              content: primaryColorDraft,
              text: primaryColorDraft,
              active: true,
              index: 4,
            },
          }).unwrap();
        } else {
          await createSiteConfig({
            type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.PRIMARY_COLOR,
            title: "Primary color",
            content: primaryColorDraft,
            text: primaryColorDraft,
            link: null,
            imgUrl: null,
            active: true,
            index: 4,
          }).unwrap();
        }
      }

      setFiles({
        logoDesktop: null,
        logoMobile: null,
        favicon: null,
      });
      setPrimaryColorDraft("");
      toast.success("Đã lưu nhận diện thương hiệu.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu nhận diện thương hiệu.");
    }
  };

  return (
    <div className="">
      <div className="mb-4">
        <Title level={4} className="mb-1!">
          Nhận diện thương hiệu
        </Title>
        <Text type="secondary" className="text-sm">
          Tải lên logo và favicon để hiển thị nhất quán trên toàn bộ hệ thống.
        </Text>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">
            Màu chính
          </p>
          <div className="flex items-center gap-2">
            <ColorPicker
              value={displayPrimaryColor}
              onChangeComplete={(color) =>
                setPrimaryColorDraft(color.toHexString())
              }
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {primaryColorDraft || currentPrimaryColor || "Chưa cấu hình"}
            </span>
          </div>
        </div>

        <Row gutter={[20, 20]}>
          {fieldItems.map(({ field, item }) => (
            <Col key={field.name} xs={24} md={24} xl={12} xxl={8}>
              <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">
                {field.label}
              </p>

              {item?.imgUrl ? (
                <img
                  src={item.imgUrl}
                  alt={field.label}
                  className="mb-3 h-28 w-full object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
              ) : (
                <div className="mb-3 h-28 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  Chưa có ảnh hiện tại
                </div>
              )}

              <UploadImageBox
                onChange={(file: File | null) =>
                  setFiles((prev) => ({
                    ...prev,
                    [field.name]: file,
                  }))
                }
                maxSizeMB={field.maxSizeMB}
              />

              <div className="mt-1 space-y-0.5">
                <Text
                  type="secondary"
                  className="text-xs block leading-relaxed"
                >
                  {field.description}
                </Text>
                <Text type="secondary" className="text-xs block">
                  Kích thước đề xuất:{" "}
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {field.recommendedSize}
                  </span>{" "}
                  · Tối đa{" "}
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {field.maxSizeMB < 1
                      ? `${field.maxSizeMB * 1000} KB`
                      : `${field.maxSizeMB} MB`}
                  </span>
                </Text>
              </div>
            </Col>
          ))}
        </Row>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handleSave()}
            loading={isSaving}
            disabled={isFetching}
          >
            Lưu nhận diện
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandIdentitySettings;
