import AnnouncementManager from "../../components/siteconfig/AnnouncementManager";
import BrandIdentitySettings from "../../components/siteconfig/BrandIdentitySettings";
import ContactIcon from "../../components/siteconfig/ContactIcon";
import ContactPageManager from "../../components/siteconfig/ContactPageManager";
import HeroBannerManager from "../../components/siteconfig/HeroBannerManager";
import SEOInformation from "../../components/siteconfig/SEOInformation";
import WebsiteInformation from "../../components/siteconfig/WebsiteInformation";
import WhyNotContent from "../../components/siteconfig/WhyNotContent";

export default function SiteConfig() {
  return (
    <div className="w-full flex flex-col gap-20">
      <BrandIdentitySettings />
      <HeroBannerManager />
      <AnnouncementManager />
      <WhyNotContent />
      <WebsiteInformation />
      <SEOInformation />
      <ContactPageManager />
      <ContactIcon />
    </div>
  );
}
