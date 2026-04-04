import { Typography } from "antd";
import { useMemo } from "react";
import TableShared from "../../components/table/TableShared";
import Button from "../../components/ui/button/Button";
import { useGetAdminNotificationsQuery } from "../../services/notification.service";
import type { Notification } from "../../types/notification.type";

const { Title, Text } = Typography;

const normalize = (value?: string | null) => (value || "").toLowerCase().trim();

const isPartnerType = (type?: string | null) => {
  const normalized = normalize(type);
  return (
    normalized.includes("partner") ||
    normalized.includes("partnership") ||
    normalized.includes("register")
  );
};

const toCsv = (rows: Notification[]) => {
  const header = ["Name", "Email", "Phone", "Content", "Type"];
  const body = rows.map((item) => [
    String(item.name || ""),
    String(item.email || ""),
    String(item.phone || ""),
    String(item.message || ""),
    String(item.type || ""),
  ]);

  const allRows = [header, ...body];
  return allRows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
};

export default function PartnerRequestsPage() {
  const { data: notifications = [], isFetching } =
    useGetAdminNotificationsQuery();

  const partnerRequests = useMemo(
    () => notifications.filter((item) => isPartnerType(item.type)),
    [notifications],
  );

  const handleExport = () => {
    const csv = toCsv(partnerRequests);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "partner-registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: "name", title: "Name" },
    { key: "email", title: "Email" },
    { key: "phone", title: "Phone" },
    {
      key: "message",
      title: "Content",
      render: (row: Notification) => (
        <span className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
          {String(row.message || "")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="mb-1!">
            Danh sách đăng ký đối tác
          </Title>
          <Text type="secondary" className="text-sm">
            Xem và export danh sách đăng ký đối tác.
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={partnerRequests.length === 0}
        >
          Export CSV
        </Button>
      </div>

      <TableShared<Notification>
        dataSource={partnerRequests}
        columns={columns}
        rowKey="id"
        loading={isFetching}
        buttonAdd={{ show: false, text: "", onAdd: () => undefined }}
        pagination={{
          current: 1,
          pageSize: partnerRequests.length || 10,
          totalPage: 1,
          totalItem: partnerRequests.length,
          pageSizeOptions: [10, 20, 50],
          onChange: () => undefined,
        }}
      />
    </div>
  );
}
