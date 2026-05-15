import { Col, ColorPicker, Form, Row, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useLayoutEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { config } from "../../config";
import { SiteConfigType } from "../../constants/siteConfig.constant";
import {
  siteConfigService,
  useUpsertSiteConfigByTypeMutation,
} from "../../services/siteConfig.service";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import type { AppDispatch } from "../../store";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import UploadImageBox from "../common/UpdloadImageBox";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

type BrandIdentitySettingsProps = {
  favicon: SiteConfigItem | null;
  mainLogo: SiteConfigItem | null;
  subLogo: SiteConfigItem | null;
  colorPrimary: SiteConfigItem | null;
};

interface FieldConfig {
  name: string;
  label: string;
  description: string;
  recommendedSize: string;
  maxSizeMB: number;
}

const FIELDS: FieldConfig[] = [
  {
    name: SiteConfigType.MainLogo,
    label: "Logo chính",
    description:
      "Logo hiển thị ở đầu trang web trên máy tính và trong các tài liệu/email của công ty.",
    recommendedSize: "400 × 120 px",
    maxSizeMB: 2,
  },
  {
    name: SiteConfigType.SubLogo,
    label: "Logo phụ",
    description: "Logo dùng cho giao diện điện thoại hoặc các vị trí cần logo vuông, nhỏ gọn.",
    recommendedSize: "120 × 120 px",
    maxSizeMB: 1,
  },
  {
    name: SiteConfigType.Favicon,
    label: "Favicon",
    description: "Biểu tượng nhỏ hiển thị trên tab trình duyệt cạnh tên website.",
    recommendedSize: "32 × 32 px",
    maxSizeMB: 0.5,
  },
];

export default function BrandIdentitySettings(props: BrandIdentitySettingsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isDirty = useRef(false);
  const { favicon, mainLogo, subLogo, colorPrimary } = { ...props };
  const [form] = useForm();
  const [upsertSiteConfigByType, { isLoading: isUpserting }] = useUpsertSiteConfigByTypeMutation();
  const [deleteImage, { isLoading: isDeletingImage }] = useDeleteImageMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  const isSaving = isUpserting || isDeletingImage || isUploadingImage;

  const currentImages = useRef({
    [SiteConfigType.MainLogo]: props?.mainLogo?.images?.[0] ?? null,
    [SiteConfigType.SubLogo]: props?.subLogo?.images?.[0] ?? null,
    [SiteConfigType.Favicon]: props?.favicon?.images?.[0] ?? null,
  });

  useLayoutEffect(() => {
    currentImages.current = {
      [SiteConfigType.MainLogo]: props?.mainLogo?.images?.[0] ?? null,
      [SiteConfigType.SubLogo]: props?.subLogo?.images?.[0] ?? null,
      [SiteConfigType.Favicon]: props?.favicon?.images?.[0] ?? null,
    };
  }, [props?.mainLogo?.images, props?.subLogo?.images, props?.favicon?.images]);

  const patchConfigImagesCache = (configId: string, images: SiteConfigItem["images"]) => {
    dispatch(
      siteConfigService.util.updateQueryData("getList", {}, (draft: any) => {
        if (!draft?.data) return;
        const target = draft.data.find((item: SiteConfigItem) => item.id === configId);
        if (!target) return;
        target.images = images ?? [];
      }),
    );
  };

  const handleSave = async (values: any) => {
    try {
      const colorValue = values?.[SiteConfigType.ColorPrimary];
      const normalizedNewColor = (
        typeof colorValue === "string"
          ? colorValue
          : (colorValue?.toHexString?.() ?? config.primaryColorDefault)
      )
        .trim()
        .toLowerCase();
      const normalizedCurrentColor = (colorPrimary?.text ?? config.primaryColorDefault)
        .trim()
        .toLowerCase();

      const siteConfigByType = {
        [SiteConfigType.MainLogo]: props?.mainLogo,
        [SiteConfigType.SubLogo]: props?.subLogo,
        [SiteConfigType.Favicon]: props?.favicon,
      };

      const imageFieldKeys = [
        SiteConfigType.MainLogo,
        SiteConfigType.SubLogo,
        SiteConfigType.Favicon,
      ];

      for (const key of imageFieldKeys) {
        const value = values?.[key];
        const existingImage = currentImages.current[key];

        const configId = siteConfigByType[key]?.id;

        if (!configId) return;

        if (value == null) {
          if (existingImage?.id) {
            await deleteImage({ id: existingImage.id }).unwrap();
            currentImages.current[key] = null;
            patchConfigImagesCache(configId, []);
          }
          continue;
        }

        if (!(value instanceof File)) continue;

        if (existingImage?.id) {
          await deleteImage({ id: existingImage.id }).unwrap();
          patchConfigImagesCache(configId, []);
        }

        const result = await uploadImage({
          files: [value],
          type: "site-config",
          id: configId,
        }).unwrap();

        const uploadedImages = (result?.data as SiteConfigItem["images"]) ?? [];
        const newImage = uploadedImages?.[0] ?? null;
        currentImages.current[key] = newImage;
        patchConfigImagesCache(configId, uploadedImages);
      }

      if (normalizedNewColor !== normalizedCurrentColor) {
        await upsertSiteConfigByType({
          type: SiteConfigType.ColorPrimary,
          body: {
            text: normalizedNewColor,
          },
        }).unwrap();
      }

      toast.success("Đã lưu nhận diện thương hiệu.");
    } catch (error) {
      console.error("Error saving brand identity:", error);
      toast.error("Đã có lỗi xảy ra khi lưu nhận diện thương hiệu. Vui lòng thử lại.");
    }
  };

  useLayoutEffect(() => {
    if (isDirty.current) {
      isDirty.current = false;
      return;
    }

    const mainLogoUrl = mainLogo?.images?.[0]?.url;
    const subLogoUrl = subLogo?.images?.[0]?.url;
    const faviconUrl = favicon?.images?.[0]?.url;

    form.setFieldsValue({
      [SiteConfigType.MainLogo]: mainLogoUrl ? config.imageBaseUrl + mainLogoUrl : null,
      [SiteConfigType.SubLogo]: subLogoUrl ? config.imageBaseUrl + subLogoUrl : null,
      [SiteConfigType.Favicon]: faviconUrl ? config.imageBaseUrl + faviconUrl : null,
      [SiteConfigType.ColorPrimary]: colorPrimary?.text || config.primaryColorDefault,
    });
  }, [favicon, mainLogo, subLogo, colorPrimary]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      onValuesChange={() => {
        isDirty.current = true;
      }}
    >
      <div className="flex items-start justify-between">
        <div className="mb-4">
          <Title level={4} className="mb-1!">
            Nhận diện thương hiệu
          </Title>
          <Text type="secondary" className="text-sm">
            Tải lên logo và favicon để hiển thị nhất quán trên toàn bộ hệ thống.
          </Text>
        </div>
        <Button variant="primary" type="submit" loading={isSaving}>
          Lưu
        </Button>
      </div>

      <Form.Item
        label={<span className="font-medium text-gray-700 dark:text-gray-200">Màu chính</span>}
        name="color_primary"
      >
        <ColorPicker />
      </Form.Item>

      <Row gutter={[20, 20]}>
        {FIELDS.map((field) => (
          <Col key={field.name} xs={24} md={24} xl={12} xxl={8}>
            <Form.Item
              name={field.name}
              label={
                <span className="font-medium text-gray-700 dark:text-gray-200">{field.label}</span>
              }
            >
              <UploadImageBox maxSizeMB={field.maxSizeMB} />
            </Form.Item>

            <div className="mt-1 space-y-0.5">
              <Text type="secondary" className="text-xs block leading-relaxed">
                {field.description}
              </Text>
              <Text type="secondary" className="text-xs block">
                Kích thước đề xuất:{" "}
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  {field.recommendedSize}
                </span>{" "}
                · Tối đa{" "}
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  {field.maxSizeMB < 1 ? `${field.maxSizeMB * 1000} KB` : `${field.maxSizeMB} MB`}
                </span>
              </Text>
            </div>
          </Col>
        ))}
      </Row>
    </Form>
  );
}
