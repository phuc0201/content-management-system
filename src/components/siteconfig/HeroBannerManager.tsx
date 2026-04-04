import { Typography } from "antd";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useCreateAdminSiteConfigMutation,
  useGetAdminSiteConfigListQuery,
  useUpdateAdminSiteConfigMutation,
  useUploadAdminSiteConfigImageMutation,
} from "../../services/siteConfig.service";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import ComponentCard from "../common/ComponentCard";
import UploadImageBox from "../common/UpdloadImageBox";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

type HeroPageKey = "home" | "about" | "manuProcess";

type HeroDraft = {
  title: string;
  content: string;
  file: File | null;
};

type HeroPage = {
  key: HeroPageKey;
  label: string;
  index: number;
  defaultType: string;
};

const HERO_PAGES: HeroPage[] = [
  { key: "home", label: "Trang chủ", index: 1, defaultType: "heroHome" },
  { key: "about", label: "Giới thiệu", index: 2, defaultType: "heroAbout" },
  {
    key: "manuProcess",
    label: "Quy trình sản xuất",
    index: 3,
    defaultType: "heroManuProcess",
  },
];

const normalizeType = (value?: string | null) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const includesTokens = (raw: string, tokens: string[]) =>
  tokens.every((token) => raw.includes(token));

const findHeroItem = (items: SiteConfigItem[], pageKey: HeroPageKey) => {
  const tokenByPage: Record<HeroPageKey, string[]> = {
    home: ["hero", "home"],
    about: ["hero", "about"],
    manuProcess: ["hero", "manu", "process"],
  };

  const tokens = tokenByPage[pageKey];
  return items.find((item) => includesTokens(normalizeType(item.type), tokens));
};

export default function HeroBannerManager() {
  const {
    data: siteConfigItems = [],
    isFetching,
    refetch,
  } = useGetAdminSiteConfigListQuery();
  const [createSiteConfig, { isLoading: isCreating }] =
    useCreateAdminSiteConfigMutation();
  const [updateSiteConfig, { isLoading: isUpdating }] =
    useUpdateAdminSiteConfigMutation();
  const [uploadHeroImage, { isLoading: isUploading }] =
    useUploadAdminSiteConfigImageMutation();

  const heroItems = useMemo(
    () =>
      HERO_PAGES.map((page) => ({
        page,
        item: findHeroItem(siteConfigItems, page.key),
      })),
    [siteConfigItems],
  );

  const [drafts, setDrafts] = useState<Record<HeroPageKey, HeroDraft>>({
    home: { title: "", content: "", file: null },
    about: { title: "", content: "", file: null },
    manuProcess: { title: "", content: "", file: null },
  });

  const updateDraft = (key: HeroPageKey, patch: Partial<HeroDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...patch,
      },
    }));
  };

  const getFinalValue = (draftValue: string, currentValue?: string | null) =>
    draftValue.trim() || currentValue || "";

  const handleSave = async (page: HeroPage, currentItem?: SiteConfigItem) => {
    const draft = drafts[page.key];

    const nextTitle = getFinalValue(draft.title, currentItem?.title);
    const nextContent = getFinalValue(draft.content, currentItem?.content);

    if (!nextTitle || !nextContent) {
      toast.warning(
        "Vui lòng nhập đầy đủ tiêu đề và nội dung cho hero banner.",
      );
      return;
    }

    try {
      let itemId = currentItem?.id;

      if (itemId) {
        await updateSiteConfig({
          id: itemId,
          body: {
            title: nextTitle,
            content: nextContent,
            active: true,
            index: page.index,
          },
        }).unwrap();
      } else {
        const created = await createSiteConfig({
          type: page.defaultType,
          title: nextTitle,
          content: nextContent,
          text: null,
          link: null,
          imgUrl: null,
          active: true,
          index: page.index,
        }).unwrap();

        itemId = created.id;
      }

      if (draft.file && itemId) {
        await uploadHeroImage({
          id: itemId,
          file: draft.file,
        }).unwrap();
      }

      updateDraft(page.key, { file: null, title: "", content: "" });
      await refetch();
      toast.success(`Đã lưu Hero banner cho ${page.label}.`);
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu Hero banner. Vui lòng thử lại.");
    }
  };

  const saving = isCreating || isUpdating || isUploading;

  return (
    <div>
      <div className="mb-6">
        <Title level={4} className="mb-1!">
          Hero banner theo từng trang
        </Title>
        <Text type="secondary" className="text-sm">
          Mỗi trang có 1 hero gồm tiêu đề, nội dung và hình ảnh.
        </Text>
      </div>

      <div className="space-y-6">
        {heroItems.map(({ page, item }) => {
          const draft = drafts[page.key];

          return (
            <ComponentCard
              key={page.key}
              title={`Hero - ${page.label}`}
              desc="Cập nhật tiêu đề, nội dung và ảnh cho phần hero."
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                      Tiêu đề
                    </p>
                    <Input
                      placeholder={item?.title || "Nhập tiêu đề hero"}
                      value={draft.title}
                      onChange={(e) =>
                        updateDraft(page.key, { title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                      Nội dung
                    </p>
                    <TextArea
                      rows={4}
                      placeholder={item?.content || "Nhập nội dung hero"}
                      value={draft.content}
                      onChange={(value) =>
                        updateDraft(page.key, { content: value })
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => void handleSave(page, item)}
                      loading={saving}
                      disabled={isFetching}
                    >
                      Lưu Hero
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    Ảnh hero
                  </p>
                  {item?.imgUrl ? (
                    <img
                      src={item.imgUrl}
                      alt={`hero-${page.key}`}
                      className="w-full h-36 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-full h-36 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                      Chưa có ảnh hiện tại
                    </div>
                  )}

                  <UploadImageBox
                    onChange={(file) => updateDraft(page.key, { file })}
                    maxSizeMB={2}
                  />
                </div>
              </div>
            </ComponentCard>
          );
        })}
      </div>
    </div>
  );
}
