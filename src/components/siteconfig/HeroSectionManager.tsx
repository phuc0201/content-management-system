import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { config } from "../../config";
import { SiteConfigType } from "../../constants/siteConfig.constant";
import { useUpsertSiteConfigByTypeMutation } from "../../services/siteConfig.service";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import ComponentCard from "../common/ComponentCard";
import UploadImageBox from "../common/UpdloadImageBox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

type HeroPageKey =
  | typeof SiteConfigType.SectionHome
  | typeof SiteConfigType.SectionAbout
  | typeof SiteConfigType.SectionManuProcess;

type HeroPage = {
  key: HeroPageKey;
  label: string;
};

const HERO_PAGES: HeroPage[] = [
  { key: SiteConfigType.SectionHome, label: "Trang chủ" },
  { key: SiteConfigType.SectionAbout, label: "Giới thiệu" },
  { key: SiteConfigType.SectionManuProcess, label: "Quy trình sản xuất" },
];

type HeroSectionManagerProps = {
  home: SiteConfigItem | null;
  about: SiteConfigItem | null;
  manuProcess: SiteConfigItem | null;
};

const PROP_MAP: Record<HeroPageKey, keyof HeroSectionManagerProps> = {
  [SiteConfigType.SectionHome]: "home",
  [SiteConfigType.SectionAbout]: "about",
  [SiteConfigType.SectionManuProcess]: "manuProcess",
};

/** ===== Image State ===== */
type ImageState = {
  file?: File;
  preview?: string;
  uploaded?: any;
  currentImageId?: string;
  isDirty?: boolean;
};

export default function HeroSectionManager(props: HeroSectionManagerProps) {
  const [form] = useForm();

  const [upsertSiteConfig, { isLoading }] = useUpsertSiteConfigByTypeMutation();
  const [uploadImage] = useUploadImageMutation();
  const [deleteImage] = useDeleteImageMutation();

  const [images, setImages] = useState<Record<HeroPageKey, ImageState>>({} as any);

  /** ===== Helpers ===== */
  const getImageUrl = (item: SiteConfigItem | null) =>
    item?.images?.[0]?.url ? config.imageBaseUrl + item.images[0].url : "";

  /** ===== Select Image ===== */
  const handleSelectImage = (file: File | null, key: HeroPageKey) => {
    if (!file) {
      setImages((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          file: undefined,
          preview: undefined,
          isDirty: true,
        },
      }));
      return;
    }

    const preview = URL.createObjectURL(file);

    setImages((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        file,
        preview,
        isDirty: true,
      },
    }));
  };

  /** ===== Save ===== */
  const handleSave = async (values: Record<string, any>) => {
    try {
      const tasks = HERO_PAGES.map(async (page) => {
        const key = page.key;
        const propKey = PROP_MAP[key];
        const existingId = props[propKey]?.id;

        const result = await upsertSiteConfig({
          type: key,
          body: { text: values[key] || "" },
        }).unwrap();

        const id = existingId || result?.id;
        const imageState = images[key];

        if (imageState?.file && id != null) {
          const res = await uploadImage({
            files: [imageState.file],
            type: "site-config",
            id,
          }).unwrap();

          const newImage = res?.data?.[0];

          // Xóa dựa vào currentImageId trong state, không phải props
          const oldImageId = imageState.currentImageId;
          if (oldImageId) {
            await deleteImage({ id: oldImageId });
          }

          // Commit UI + cập nhật currentImageId sang id mới
          setImages((prev) => ({
            ...prev,
            [key]: {
              preview: config.imageBaseUrl + newImage.url,
              currentImageId: newImage.id, // ← id mới, lần sau sẽ xóa đúng
              isDirty: false,
            },
          }));
        }
      });

      await Promise.all(tasks);
      toast.success("Lưu thành công");
    } catch (error) {
      console.error(error);
      toast.error("Lưu thất bại");
    }
  };
  /** ===== Init (ONLY ONCE) ===== */
  useEffect(() => {
    const initImages: Record<HeroPageKey, ImageState> = {} as any;

    HERO_PAGES.forEach((page) => {
      const propKey = PROP_MAP[page.key];
      initImages[page.key] = {
        preview: getImageUrl(props[propKey]),
        currentImageId: props[propKey]?.images?.[0]?.id,
        isDirty: false,
      };
    });

    setImages(initImages);

    form.setFieldsValue({
      [SiteConfigType.SectionHome]: props.home?.text || "",
      [SiteConfigType.SectionAbout]: props.about?.text || "",
      [SiteConfigType.SectionManuProcess]: props.manuProcess?.text || "",
    });
  }, []);

  /** ===== Cleanup blob URL ===== */
  useEffect(() => {
    return () => {
      Object.values(images).forEach((img) => {
        if (img.preview?.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  return (
    <Form layout="vertical" form={form} onFinish={handleSave}>
      <div className="mb-4 flex justify-between items-start">
        <div>
          <Title level={4}>Quản lý ảnh đầu trang</Title>
          <Text type="secondary">Mỗi trang có tiêu đề + ảnh hero</Text>
        </div>

        <Button variant="primary" type="submit" loading={isLoading}>
          Lưu
        </Button>
      </div>

      <div className="space-y-4">
        {HERO_PAGES.map((page) => {
          const imageState = images[page.key];

          return (
            <ComponentCard
              key={page.key}
              title={page.label}
              children={
                <div className="space-y-4">
                  <Form.Item label="Tiêu đề" name={page.key}>
                    <Input placeholder={`Tiêu đề ${page.label}`} />
                  </Form.Item>

                  <UploadImageBox
                    value={imageState?.preview}
                    onChange={(file) => handleSelectImage(file, page.key)}
                    maxSizeMB={10}
                  />
                </div>
              }
            />
          );
        })}
      </div>
    </Form>
  );
}
