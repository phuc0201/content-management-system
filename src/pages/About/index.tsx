import { Typography } from "antd";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import {
  useCreateAdminAboutsMutation,
  useGetAboutsQuery,
  useGetAdminAboutsQuery,
  useUpdateAdminAboutsMutation,
} from "../../services/about.service";
import type { CoreValueItem as AboutCoreValueItem } from "../../types/about.type";

const { Title, Text } = Typography;

interface CoreValueInputItem {
  id: string;
  title: string;
}

interface AboutData {
  intro: string;
  vision: string;
  mission: string;
  coreValues: CoreValueInputItem[];
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AboutPage() {
  const { data: aboutContent } = useGetAboutsQuery();
  console.log("aboutContent", aboutContent);
  const { data: adminAboutItems = [], isFetching } = useGetAdminAboutsQuery();
  const [createAbout, { isLoading: isCreating }] =
    useCreateAdminAboutsMutation();
  const [updateAbout, { isLoading: isUpdating }] =
    useUpdateAdminAboutsMutation();

  const [introDraft, setIntroDraft] = useState<string | null>(null);
  const [visionDraft, setVisionDraft] = useState<string | null>(null);
  const [missionDraft, setMissionDraft] = useState<string | null>(null);
  const [coreValuesDraft, setCoreValuesDraft] = useState<
    CoreValueInputItem[] | null
  >(null);

  const initialData = useMemo<AboutData>(
    () => ({
      intro: "",
      vision: "",
      mission: "",
      coreValues: [],
    }),
    [aboutContent],
  );

  const data: AboutData = {
    intro: introDraft ?? initialData.intro,
    vision: visionDraft ?? initialData.vision,
    mission: missionDraft ?? initialData.mission,
    coreValues: coreValuesDraft ?? initialData.coreValues,
  };

  const firstAdminAbout = useMemo(() => adminAboutItems[0], [adminAboutItems]);

  function addCoreValue() {
    setCoreValuesDraft([...data.coreValues, { id: genId(), title: "" }]);
  }

  function updateCoreValue(id: string, title: string) {
    setCoreValuesDraft(
      data.coreValues.map((value) =>
        value.id === id ? { ...value, title } : value,
      ),
    );
  }

  function removeCoreValue(id: string) {
    setCoreValuesDraft(data.coreValues.filter((value) => value.id !== id));
  }

  async function handleSave() {
    const intro = data.intro.trim();
    const vision = data.vision.trim();
    const mission = data.mission.trim();
    const coreValue = data.coreValues
      .map(
        (item, index): AboutCoreValueItem => ({
          title: item.title.trim(),
          index: index + 1,
        }),
      )
      .filter((item) => item.title.length > 0);

    if (!intro || !vision || !mission) {
      toast.warning("Vui lòng nhập đầy đủ giới thiệu, tầm nhìn và sứ mệnh.");
      return;
    }

    const payload = {
      intro,
      vision,
      mission,
      coreValue,
    };

    try {
      if (firstAdminAbout?.id) {
        await updateAbout({
          id: firstAdminAbout.id,
          body: payload,
        }).unwrap();
      } else {
        await createAbout(payload).unwrap();
      }

      toast.success("Đã lưu thay đổi About page.");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi lưu. Vui lòng thử lại.");
    }
  }

  const isSaving = isCreating || isUpdating;

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
          <Button
            variant="primary"
            size="md"
            loading={isSaving}
            onClick={() => void handleSave()}
            disabled={isFetching}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold mb-3">Giới thiệu chung</h4>
        <TextArea
          placeholder="Nhập nội dung"
          value={data.intro}
          onChange={setIntroDraft}
          rows={6}
          disabled={isFetching}
        />
      </section>

      <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-lg font-semibold mb-3">Tầm nhìn</h4>
          <TextArea
            placeholder="Nhập nội dung"
            value={data.vision}
            onChange={setVisionDraft}
            rows={5}
            disabled={isFetching}
          />
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-3">Sứ mệnh</h4>
          <TextArea
            placeholder="Nhập nội dung"
            value={data.mission}
            onChange={setMissionDraft}
            rows={5}
            disabled={isFetching}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold">Giá trị cốt lõi</h4>
          <Button size="md" onClick={addCoreValue} disabled={isFetching}>
            Thêm giá trị
          </Button>
        </div>

        <div className="space-y-3">
          {data.coreValues.map((value) => (
            <div key={value.id} className="flex gap-3 items-center">
              <Input
                placeholder="Nhập nội dung"
                value={value.title}
                onChange={(event) =>
                  updateCoreValue(value.id, event.target.value)
                }
                className="flex-1"
                disabled={isFetching}
              />
              <button
                className="text-red-500 border-red-200 border h-full px-4 py-2 rounded-lg hover:border-red-400 transition-colors"
                onClick={() => removeCoreValue(value.id)}
                disabled={isFetching}
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
