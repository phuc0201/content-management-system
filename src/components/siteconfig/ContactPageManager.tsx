import { Typography } from "antd";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SYSTEM_CONSTANT } from "../../constants/system.constant";
import { useGetAdminNotificationsQuery } from "../../services/notification.service";
import {
  useCreateAdminSiteConfigMutation,
  useGetAdminSiteConfigListQuery,
  useUpdateAdminSiteConfigMutation,
} from "../../services/siteConfig.service";
import type { Notification } from "../../types/notification.type";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import TableShared from "../table/TableShared";
import Button from "../ui/button/Button";

const { Title, Text } = Typography;

const normalize = (value?: string | null) =>
  (value || "").toLowerCase().replace(/[^a-z0-9]/g, "");

type ContactInfoField = {
  key: "name" | "address" | "taxCode" | "phoneNumber" | "email" | "lat" | "lng";
  type: string;
  label: string;
  index: number;
  numeric?: boolean;
};

const CONTACT_INFO_FIELDS: ContactInfoField[] = [
  {
    key: "name",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.CONTACT_INFO_NAME,
    label: "Tên công ty",
    index: 30,
  },
  {
    key: "address",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.CONTACT_INFO_ADDRESS,
    label: "Địa chỉ",
    index: 31,
  },
  {
    key: "taxCode",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.CONTACT_INFO_TAX_CODE,
    label: "Mã số thuế",
    index: 32,
  },
  {
    key: "phoneNumber",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.CONTACT_INFO_PHONE,
    label: "Số điện thoại",
    index: 33,
  },
  {
    key: "email",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.CONTACT_INFO_EMAIL,
    label: "Email",
    index: 34,
  },
  {
    key: "lat",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.CONTACT_INFO_LAT,
    label: "Latitude",
    index: 35,
    numeric: true,
  },
  {
    key: "lng",
    type: SYSTEM_CONSTANT.SITE_CONFIG_TYPE.CONTACT_INFO_LNG,
    label: "Longitude",
    index: 36,
    numeric: true,
  },
];

const findByType = (items: SiteConfigItem[], type: string) => {
  const normalizedType = normalize(type);
  return items.find((item) => normalize(item.type).includes(normalizedType));
};

const isContactType = (type?: string | null) =>
  normalize(type).includes("contact");

export default function ContactPageManager() {
  const { data: siteConfigItems = [], isFetching } =
    useGetAdminSiteConfigListQuery();
  const { data: notifications = [], isFetching: fetchingNotifications } =
    useGetAdminNotificationsQuery();
  const [createSiteConfig, { isLoading: isCreating }] =
    useCreateAdminSiteConfigMutation();
  const [updateSiteConfig, { isLoading: isUpdating }] =
    useUpdateAdminSiteConfigMutation();

  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const fieldItems = useMemo(
    () =>
      CONTACT_INFO_FIELDS.map((field) => ({
        field,
        item: findByType(siteConfigItems, field.type),
      })),
    [siteConfigItems],
  );

  const contactRequests = useMemo(
    () =>
      notifications.filter((item) => isContactType(String(item.type || ""))),
    [notifications],
  );

  const isSaving = isCreating || isUpdating;

  const getFieldValue = (field: ContactInfoField, item?: SiteConfigItem) => {
    if (draftValues[field.key] !== undefined) return draftValues[field.key];
    return String(item?.content || item?.text || "");
  };

  const handleSave = async () => {
    try {
      for (const { field, item } of fieldItems) {
        const rawValue = getFieldValue(field, item).trim();
        if (!rawValue) continue;

        if (item?.id) {
          await updateSiteConfig({
            id: item.id,
            body: {
              title: field.label,
              content: rawValue,
              text: rawValue,
              active: true,
              index: field.index,
            },
          }).unwrap();
        } else {
          await createSiteConfig({
            type: field.type,
            title: field.label,
            content: rawValue,
            text: rawValue,
            link: null,
            imgUrl: null,
            active: true,
            index: field.index,
          }).unwrap();
        }
      }

      setDraftValues({});
      toast.success("Đã lưu thông tin Contact page.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu thông tin Contact page.");
    }
  };

  const columns = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    {
      key: "message",
      title: "Message",
      render: (row: Notification) => (
        <span className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
          {String(row.message || "")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="mb-1!">
            Quản lý Contact page
          </Title>
          <Text type="secondary" className="text-sm">
            Cập nhật thông tin công ty, toạ độ bản đồ và xem danh sách contact
            requests.
          </Text>
        </div>
        <Button
          onClick={() => void handleSave()}
          loading={isSaving}
          disabled={isFetching}
        >
          Lưu thông tin Contact
        </Button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldItems.map(({ field, item }) => (
          <div key={field.key}>
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-200">
              {field.label}
            </p>
            {field.key === "address" ? (
              <TextArea
                rows={3}
                value={getFieldValue(field, item)}
                onChange={(value) =>
                  setDraftValues((prev) => ({
                    ...prev,
                    [field.key]: value,
                  }))
                }
                placeholder={`Nhập ${field.label.toLowerCase()}`}
                disabled={isFetching}
              />
            ) : (
              <Input
                type={field.numeric ? "number" : "text"}
                value={getFieldValue(field, item)}
                onChange={(event) =>
                  setDraftValues((prev) => ({
                    ...prev,
                    [field.key]: event.target.value,
                  }))
                }
                placeholder={`Nhập ${field.label.toLowerCase()}`}
                disabled={isFetching}
              />
            )}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-sm text-gray-700 dark:text-gray-200">
          Danh sách contact requests
        </p>
        <TableShared<Notification>
          dataSource={contactRequests}
          rowKey="id"
          columns={columns}
          loading={fetchingNotifications}
          buttonAdd={{ show: false, text: "", onAdd: () => undefined }}
          pagination={{
            current: 1,
            pageSize: contactRequests.length || 10,
            totalPage: 1,
            totalItem: contactRequests.length,
            pageSizeOptions: [10, 20, 50],
            onChange: () => undefined,
          }}
        />
      </section>
    </div>
  );
}
