import { Typography } from "antd";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
const { Title, Text } = Typography;

interface Reason {
  id: number;
  title: string;
  description: string;
}

export default function zWhyNotContent() {
  const [reasons, setReasons] = useState<Reason[]>([
    {
      id: 1,
      title: "Fast & Reliable",
      description: "Lightning-fast performance with 99.9% uptime",
    },
  ]);

  const handleReasonChange = (id: number, field: "title" | "description", value: string) => {
    setReasons(reasons.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addReason = () => {
    if (reasons.length < 3) {
      setReasons([...reasons, { id: Date.now(), title: "", description: "" }]);
    }
  };

  const removeReason = (id: number) => {
    if (reasons.length > 1) {
      setReasons(reasons.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Title level={4} className="mb-1!">
          Lý do chọn doanh nghiệp
        </Title>
        <Text type="secondary" className="text-sm">
          Quản lý nội dung các lí do khách hàng chọn chúng tôi (1-3 mục).
        </Text>
      </div>

      <div className="w-full">
        <ComponentCard>
          <div className="space-y-6">
            {reasons.map((reason, index) => (
              <div
                key={reason.id}
                className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-gray-700 dark:border-gray-700  p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700 dark:text-gray-200">
                    Reason {index + 1}
                  </p>
                  <button
                    onClick={() => removeReason(reason.id)}
                    disabled={reasons.length === 1}
                    className="text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                    <Input
                      value={reason.title}
                      onChange={(e) => handleReasonChange(reason.id, "title", e.target.value)}
                      placeholder="Nhập tiêu đề..."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Description
                    </label>
                    <TextArea
                      value={reason.description}
                      onChange={(e: any) =>
                        handleReasonChange(reason.id, "description", e.target.value)
                      }
                      placeholder="Nhập mô tả..."
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                onClick={addReason}
                disabled={reasons.length === 3}
                type="button"
                className="flex-1 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:border-gray-700 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
              >
                + Thêm lí do
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Lưu nội dung
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
