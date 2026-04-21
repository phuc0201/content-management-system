import { Tabs, Typography } from "antd";
import { useState, type ReactNode } from "react";
import AnnouncementManager from "../../components/siteconfig/AnnouncementManager";
import BrandIdentitySettings from "../../components/siteconfig/BrandIdentitySettings";
import ContactIcon from "../../components/siteconfig/ContactIcon";
import HeroSectionManager from "../../components/siteconfig/HeroSectionManager";
import WhyNotContent from "../../components/siteconfig/WhyNotContent";
import { SiteConfigType } from "../../constants/siteConfig.constant";
import { useGetSiteConfigsQuery } from "../../services/siteConfig.service";

const { Title, Text } = Typography;

type TabConfig = {
  key: string;
  label: string;
  render: () => ReactNode;
};

export default function SiteConfig() {
  const [activeTab, setActiveTab] = useState("brand");
  const { data: siteConfigResult } = useGetSiteConfigsQuery({});

  const brandIdetityConfig = {
    favicon:
      siteConfigResult?.data?.find((config) => config.type === SiteConfigType.Favicon) || null,
    mainLogo:
      siteConfigResult?.data?.find((config) => config.type === SiteConfigType.MainLogo) || null,
    subLogo:
      siteConfigResult?.data?.find((config) => config.type === SiteConfigType.SubLogo) || null,
    colorPrimary:
      siteConfigResult?.data?.find((config) => config.type === SiteConfigType.ColorPrimary) || null,
  };

  const tabs: TabConfig[] = [
    {
      key: "brand",
      label: "Nhận diện thương hiệu",
      render: () => <BrandIdentitySettings {...brandIdetityConfig} />,
    },
    {
      key: "hero",
      label: "Ảnh đầu trang",
      render: () => <HeroSectionManager />,
    },
    {
      key: "announce",
      label: "Thông báo",
      render: () => <AnnouncementManager />,
    },
    {
      key: "whyUs",
      label: "Lý do chọn doanh nghiệp",
      render: () => <WhyNotContent />,
    },
    {
      key: "contact",
      label: "Icon liên hệ",
      render: () => <ContactIcon />,
    },
  ];

  return (
    <div className="">
      <div className="bg-white dark:bg-gray-900 pt-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div>
            <div className="mb-4">
              <Title level={4} className="mb-1!">
                Cấu hình trang web
              </Title>
              <Text type="secondary" className="text-sm">
                Quản lý cấu hình hiển thị, thông tin liên hệ và các cài đặt khác của trang web.
              </Text>
            </div>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{ marginBottom: 0 }}
          tabBarGutter={20}
          items={tabs.map((tab) => ({
            key: tab.key,
            label: <span className="text-sm">{tab.label}</span>,
            children: <div className="pt-6">{tab.render()}</div>,
          }))}
          style={{ userSelect: "none" }}
        />
      </div>
    </div>
  );
}
