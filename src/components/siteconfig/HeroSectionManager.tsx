import { Form, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
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
  currentImageId?: string;
  isDirty?: boolean;
};

export default function HeroSectionManager(props: HeroSectionManagerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = useForm();

  const [upsertSiteConfig, { isLoading: isUpserting }] = useUpsertSiteConfigByTypeMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteImageMutation();

  const isSaving = isUpserting || isUploading || isDeleting;

  const [images, setImages] = useState<Record<HeroPageKey, ImageState>>({} as any);

  const patchSectionImagesCache = (configId: string, newImages: SiteConfigItem["images"]) => {
    dispatch(
      siteConfigService.util.updateQueryData("getList", {}, (draft: any) => {
        if (!draft?.data) return;
        const target = draft.data.find((item: SiteConfigItem) => item.id === configId);
        if (!target) return;
        target.images = newImages ?? [];
      }),
    );
  };

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
      for (const page of HERO_PAGES) {
        const key = page.key;
        const propKey = PROP_MAP[key];
        const currentConfig = props[propKey];
        const imageState = images[key];
        const oldImageId = imageState?.currentImageId ?? currentConfig?.images?.[0]?.id;

        const nextTitle = String(values[key] ?? "").trim();
        const currentTitle = String(currentConfig?.title ?? "").trim();
        const isTitleChanged = nextTitle !== currentTitle;

        const selectedFile = imageState?.file;
        const isRemovingImage = imageState?.isDirty && !selectedFile && !imageState?.preview;
        const isUploadingImage = selectedFile instanceof File;
        const hasImageChange = Boolean(isRemovingImage || isUploadingImage);

        if (!isTitleChanged && !hasImageChange) {
          continue;
        }

        let configId = currentConfig?.id;

        if (isTitleChanged || (!configId && hasImageChange)) {
          const result = await upsertSiteConfig({
            type: key,
            body: { title: nextTitle },
          }).unwrap();
          configId = result?.id;
        }

        if (!configId) continue;

        if (isRemovingImage) {
          if (oldImageId) {
            await deleteImage({ id: oldImageId }).unwrap();
            patchSectionImagesCache(configId, []);
          }

          setImages((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              file: undefined,
              preview: undefined,
              currentImageId: undefined,
              isDirty: false,
            },
          }));
          continue;
        }

        if (selectedFile instanceof File) {
          if (oldImageId) {
            await deleteImage({ id: oldImageId }).unwrap();
            patchSectionImagesCache(configId, []);
          }

          const res = await uploadImage({
            files: [selectedFile],
            type: "site-config",
            id: configId,
          }).unwrap();

          const uploadedImages = (res?.data as SiteConfigItem["images"]) ?? [];
          const newImage = uploadedImages?.[0];
          patchSectionImagesCache(configId, uploadedImages);

          setImages((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              file: undefined,
              preview: newImage?.url ? config.imageBaseUrl + newImage.url : undefined,
              currentImageId: newImage?.id,
              isDirty: false,
            },
          }));
        }
      }

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
      [SiteConfigType.SectionHome]: props.home?.title || "",
      [SiteConfigType.SectionAbout]: props.about?.title || "",
      [SiteConfigType.SectionManuProcess]: props.manuProcess?.title || "",
    });
  }, [props.home, props.about, props.manuProcess, form]);

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

        <Button variant="primary" type="submit" loading={isSaving}>
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
