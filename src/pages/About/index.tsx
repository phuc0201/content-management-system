import { Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import UploadImageBox from "../../components/common/UpdloadImageBox";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";

const { Title, Text } = Typography;

interface HeroSection {
  title: string;
  content: string;
  imgUrl?: string;
}

interface CoreValueItem {
  id: string;
  title: string;
}

interface AboutData {
  heroSection: HeroSection;
  intro: string;
  vision: string;
  mission: string;
  coreValues: CoreValueItem[];
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData>(() => ({
    heroSection: { title: "", content: "", imgUrl: undefined },
    intro: "",
    vision: "",
    mission: "",
    coreValues: [],
  }));

  // local file for hero image
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const heroPreview = useMemo(
    () => (heroFile ? URL.createObjectURL(heroFile) : data.heroSection.imgUrl),
    [heroFile, data.heroSection.imgUrl],
  );

  useEffect(() => {
    return () => {
      if (heroFile) URL.revokeObjectURL(heroPreview as string);
    };
  }, [heroFile, heroPreview]);

  function updateHero(partial: Partial<HeroSection>) {
    setData((d) => ({ ...d, heroSection: { ...d.heroSection, ...partial } }));
  }

  function addCoreValue() {
    setData((d) => ({ ...d, coreValues: [...d.coreValues, { id: genId(), title: "" }] }));
  }

  function updateCoreValue(id: string, title: string) {
    setData((d) => ({
      ...d,
      coreValues: d.coreValues.map((v) => (v.id === id ? { ...v, title } : v)),
    }));
  }

  function removeCoreValue(id: string) {
    setData((d) => ({ ...d, coreValues: d.coreValues.filter((v) => v.id !== id) }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const payload = { ...data } as AboutData;
      if (heroFile) {
        // in real impl upload file and receive url, here we just use preview for demo
        payload.heroSection.imgUrl = heroPreview as string;
      }

      await new Promise((r) => setTimeout(r, 600));
      toast.success("Đã lưu thay đổi About page.");
      console.log("Saved about payload:", payload);
      setData(payload);
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi lưu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4}>Quản lý thông tin giới thiệu</Title>
          <Text type="secondary" className="text-sm">
            Sửa nội dung hiển thị trên trang giới thiệu.
          </Text>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="md" loading={isSaving} onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Banner giới thiệu</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <div className="space-y-3 flex flex-col min-h-0">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tiêu đề</label>

            <Input
              placeholder="Nhập nội dung"
              value={data.heroSection.title}
              onChange={(e: any) => updateHero({ title: e.target.value })}
            />

            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Nội dung mô tả ngắn
            </label>

            <div className="flex-1 min-h-0">
              <TextArea
                className="h-full"
                value={data.heroSection.content}
                onChange={(e: any) => updateHero({ content: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Ảnh banner
            </label>
            <UploadImageBox
              onChange={(f: any) => {
                setHeroFile(f as File | null);
              }}
              maxSizeMB={4}
            />
            {heroPreview && (
              <div className="mt-2">
                <img
                  src={heroPreview as string}
                  alt="hero preview"
                  className="w-full max-h-56 object-contain rounded"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* GENERAL INTRODUCTION */}
      <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold mb-3">Giới thiệu chung</h4>
        <TextArea
          placeholder="Nhập nội dung"
          value={data.intro}
          onChange={(e: any) => setData((s) => ({ ...s, intro: e.target.value }))}
          rows={6}
        />
      </section>

      {/* VISION / MISSION */}
      <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-lg font-semibold mb-3">Tầm nhìn</h4>
          <TextArea
            placeholder="Nhập nội dung"
            value={data.vision}
            onChange={(e: any) => setData((s) => ({ ...s, vision: e.target.value }))}
            rows={5}
          />
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-3">Sứ mệnh</h4>
          <TextArea
            placeholder="Nhập nội dung"
            value={data.mission}
            onChange={(e: any) => setData((s) => ({ ...s, mission: e.target.value }))}
            rows={5}
          />
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Giá trị cốt lõi</h4>
          <Button size="md" onClick={addCoreValue}>
            Thêm giá trị
          </Button>
        </div>

        <div className="space-y-3">
          {data.coreValues.map((v) => (
            <div key={v.id} className="flex gap-3 items-center">
              <Input
                placeholder="Nhập nội dung"
                value={v.title}
                onChange={(e: any) => updateCoreValue(v.id, e.target.value)}
                className="flex-1"
              />
              <button
                className="text-red-500 border-red-200 border h-full px-4 py-2 rounded-lg  hover:border-red-400 transition-colors"
                onClick={() => removeCoreValue(v.id)}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
