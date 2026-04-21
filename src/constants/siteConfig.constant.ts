// muốn cập nhật ảnh cho site config thì gọi updateImage truyền type = "site-config" và id = siteConfigItem.id bên BE sẽ tự Map link ảnh vào site config đó

export const SiteConfigType = {
  Favicon: "favicon",
  MainLogo: "main_logo",
  SubLogo: "sub_logo",
  TopBar: "top_bar", // text
  Contact: "contact", // title + content + link có data default - có thể dùng cho các contact icon như facebook, instagram, linkedin, tiktok ( title + link )
  CompanyName: "company_name", // text
  CompanyAddress: "company_address", // text
  CompanyTaxCode: "company_tax_code", // text
  CompanyPhoneNumber: "company_phone_number", // text
  CompanyEmail: "company_email", // text
  CompanyLng: "company_lng", // text
  CompanyLat: "company_lat", // text
  SectionHome: "section_home", // text
  SectionAbout: "section_about", // text
  SectionManuProcess: "section_manu_process", // text
  ColorPrimary: "color_primary", // text
  ColorSecondary: "color_secondary", // text
  AboutIntro: "about_intro", // text
  AboutVision: "about_vision", // text
  AboutMission: "about_mission", // text
  AboutCoreValue: "about_core_value", //index + text
  ManuProcess: "manu_process_title", // title + content
  ManuProcessStep: "manu_process_step", //index + title + content
};
