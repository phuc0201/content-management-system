import AnnouncementManager from "../../components/siteconfig/AnnouncementManager";
import BrandIdentitySettings from "../../components/siteconfig/BrandIdentitySettings";
import ContactIcon from "../../components/siteconfig/ContactIcon";
import WhyNotContent from "../../components/siteconfig/WhyNotContent";

export default function SiteConfig() {
  return (
    <div className="w-full flex flex-col gap-20">
      <BrandIdentitySettings />
      <AnnouncementManager />
      <WhyNotContent />
      <ContactIcon />
    </div>
  );
}
