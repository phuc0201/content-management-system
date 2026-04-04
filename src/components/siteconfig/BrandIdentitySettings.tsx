import { Col, ColorPicker, Form, Row, Typography } from "antd";
import { useForm } from "antd/es/form/Form";
import UploadImageBox from "../common/UpdloadImageBox";

const { Title, Text } = Typography;

interface BrandIdentityFormValues {
  logoDesktop: File | null;
  logoMobile: File | null;
  favicon: File | null;
  primaryColor: string;
}

interface FieldConfig {
  name: keyof BrandIdentityFormValues;
  label: string;
  description: string;
  recommendedSize: string;
  maxSizeMB: number;
}

const FIELDS: FieldConfig[] = [
  {
    name: "logoDesktop",
    label: "Logo chính",
    description: "Hiển thị trên header desktop, email, tài liệu in ấn.",
    recommendedSize: "400 × 120 px",
    maxSizeMB: 2,
  },
  {
    name: "logoMobile",
    label: "Logo mobile",
    description: "Hiển thị trên thiết bị di động, thường là dạng icon vuông.",
    recommendedSize: "120 × 120 px",
    maxSizeMB: 1,
  },
  {
    name: "favicon",
    label: "Favicon",
    description: "Icon hiển thị trên tab trình duyệt.",
    recommendedSize: "32 × 32 px",
    maxSizeMB: 0.5,
  },
];

const BrandIdentitySettings: React.FC = () => {
  const [form] = useForm<BrandIdentityFormValues>();

  return (
    <div className="">
      <div className="mb-4">
        <Title level={4} className="mb-1!">
          Nhận diện thương hiệu
        </Title>
        <Text type="secondary" className="text-sm">
          Tải lên logo và favicon để hiển thị nhất quán trên toàn bộ hệ thống.
        </Text>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          label={<span className="font-medium text-gray-700 dark:text-gray-200">Màu chính</span>}
          name="primaryColor"
        >
          <ColorPicker />
        </Form.Item>

        <Row gutter={[20, 20]}>
          {FIELDS.map((field) => (
            <Col key={field.name} xs={24} md={24} xl={12} xxl={8}>
              <Form.Item
                name={field.name}
                label={
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {field.label}
                  </span>
                }
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.reject(new Error(`Vui lòng tải lên ${field.label}`));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Form.Item noStyle shouldUpdate>
                  {({ setFieldValue }) => (
                    <UploadImageBox
                      onChange={(file: File | null) => setFieldValue(field.name, file)}
                      maxSizeMB={field.maxSizeMB}
                    />
                  )}
                </Form.Item>
              </Form.Item>

              <div className="mt-1 space-y-0.5">
                <Text type="secondary" className="text-xs block leading-relaxed">
                  {field.description}
                </Text>
                <Text type="secondary" className="text-xs block">
                  Kích thước đề xuất:{" "}
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {field.recommendedSize}
                  </span>{" "}
                  · Tối đa{" "}
                  <span className="font-medium text-gray-600 dark:text-gray-400">
                    {field.maxSizeMB < 1 ? `${field.maxSizeMB * 1000} KB` : `${field.maxSizeMB} MB`}
                  </span>
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </Form>
    </div>
  );
};

export default BrandIdentitySettings;
