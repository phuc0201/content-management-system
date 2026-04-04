import { Typography } from "antd";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SYSTEM_CONSTANT } from "../../constants/system.constant";
import {
  useCreateAdminSiteConfigMutation,
  useGetAdminSiteConfigListQuery,
  useUpdateAdminSiteConfigMutation,
} from "../../services/siteConfig.service";
import TextArea from "../form/input/TextArea";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

const normalize = (value?: string | null) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export default function SEOInfomation() {
  const { data: siteConfigItems = [], isFetching } =
    useGetAdminSiteConfigListQuery();
  const [createSeoInfo, { isLoading: isCreating }] =
    useCreateAdminSiteConfigMutation();
  const [updateSeoInfo, { isLoading: isUpdating }] =
    useUpdateAdminSiteConfigMutation();

  const seoItem = useMemo(
    () =>
      siteConfigItems.find((item) =>
        normalize(item.type).includes(
          normalize(SYSTEM_CONSTANT.SITE_CONFIG_TYPE.SEO_INFO),
        ),
      ),
    [siteConfigItems],
  );

  const [seoContent, setSeoContent] = useState("");

  const handleSave = async () => {
    const nextValue = seoContent.trim();

    if (!nextValue) {
      toast.warning("Vui lòng nhập nội dung SEO.");
      return;
    }

    try {
      if (seoItem?.id) {
        await updateSeoInfo({
          id: seoItem.id,
          body: {
            title: "SEO information",
            content: nextValue,
            text: nextValue,
            active: true,
            index: 21,
          },
        }).unwrap();
      } else {
        await createSeoInfo({
          type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.SEO_INFO,
          title: "SEO information",
          content: nextValue,
          text: nextValue,
          link: null,
          imgUrl: null,
          active: true,
          index: 21,
        }).unwrap();
      }

      setSeoContent("");
      toast.success("Đã lưu thông tin SEO.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu thông tin SEO.");
    }
  };

  const currentValue = seoItem?.content || seoItem?.text || "";
  const isSaving = isCreating || isUpdating;

  return (
    <div>
      <div className="mb-6">
        <Title level={4} className="mb-1!">
          Thông tin SEO
        </Title>
        <Text type="secondary" className="text-sm">
          Cập nhật nội dung SEO chung cho website.
        </Text>
      </div>

      <div className="space-y-3">
        <TextArea
          rows={4}
          placeholder={currentValue || "Nhập nội dung SEO"}
          value={seoContent}
          onChange={setSeoContent}
          disabled={isFetching}
        />

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => void handleSave()}
            loading={isSaving}
            disabled={isFetching}
          >
            Lưu thông tin SEO
          </Button>
        </div>
      </div>
    </div>
  );
}
