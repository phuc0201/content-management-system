import { Typography } from "antd";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SYSTEM_CONSTANT } from "../../constants/system.constant";
import {
  useCreateAdminSiteConfigMutation,
  useGetAdminSiteConfigListQuery,
  useUpdateAdminSiteConfigMutation,
} from "../../services/siteConfig.service";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
const { Title, Text } = Typography;

const normalize = (value?: string | null) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const WebsiteInformation = () => {
  const { data: siteConfigItems = [], isFetching } =
    useGetAdminSiteConfigListQuery();
  const [createWebsiteInfo, { isLoading: isCreating }] =
    useCreateAdminSiteConfigMutation();
  const [updateWebsiteInfo, { isLoading: isUpdating }] =
    useUpdateAdminSiteConfigMutation();

  const websiteInfoItem = useMemo(
    () =>
      siteConfigItems.find((item) =>
        normalize(item.type).includes(
          normalize(SYSTEM_CONSTANT.SITE_CONFIG_TYPE.WEBSITE_INFO),
        ),
      ),
    [siteConfigItems],
  );

  const [websiteName, setWebsiteName] = useState("");

  const handleSave = async () => {
    const nextValue = websiteName.trim();

    if (!nextValue) {
      toast.warning("Vui lòng nhập thông tin website.");
      return;
    }

    try {
      if (websiteInfoItem?.id) {
        await updateWebsiteInfo({
          id: websiteInfoItem.id,
          body: {
            title: "Website information",
            content: nextValue,
            text: nextValue,
            active: true,
            index: 20,
          },
        }).unwrap();
      } else {
        await createWebsiteInfo({
          type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.WEBSITE_INFO,
          title: "Website information",
          content: nextValue,
          text: nextValue,
          link: null,
          imgUrl: null,
          active: true,
          index: 20,
        }).unwrap();
      }

      setWebsiteName("");
      toast.success("Đã lưu thông tin website.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu thông tin website.");
    }
  };

  const currentValue = websiteInfoItem?.content || websiteInfoItem?.text || "";
  const isSaving = isCreating || isUpdating;

  return (
    <div>
      <div className="mb-6">
        <Title level={4} className="mb-1!">
          Thông tin website
        </Title>
        <Text type="secondary" className="text-sm">
          Cập nhật thông tin cơ bản của website.
        </Text>
      </div>

      <div className="space-y-3">
        <Input
          placeholder={currentValue || "Nhập thông tin website"}
          value={websiteName}
          onChange={(e) => setWebsiteName(e.target.value)}
          disabled={isFetching}
        />

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => void handleSave()}
            loading={isSaving}
            disabled={isFetching}
          >
            Lưu thông tin website
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteInformation;
