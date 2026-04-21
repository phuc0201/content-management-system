import { Typography } from "antd";
import ComponentCard from "../common/ComponentCard";
import UploadImageBox from "../common/UpdloadImageBox";
import Input from "../form/input/InputField";

type HeroPageKey = "home" | "about" | "manuProcess";

// type HeroDraft = {
//   title: string;
//   content: string;
//   file: File | null;
// };

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

export default function HeroSectionManager() {
  const { Title, Text } = Typography;

  return (
    <div>
      <div className="mb-4">
        <Title level={4} className="mb-1">
          Quản lý ảnh đầu trang
        </Title>
        <Text type="secondary" className="text-sm">
          Thêm ảnh hiển thị ở phần đầu website, mỗi trang có 1 hero gồm tiêu đề, nội dung và hình
          ảnh.
        </Text>
      </div>

      <div className="flex flex-col gap-4">
        {HERO_PAGES.map((page) => (
          <ComponentCard
            key={page.key}
            title={`${page.label}`}
            children={
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">Tiêu đề</p>
                      <Input placeholder={"Nhập tiêu đề"} />
                    </div>
                    <UploadImageBox />
                  </div>
                </div>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
