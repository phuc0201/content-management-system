import { Typography } from "antd";
import { useLayoutEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { PlusIcon } from "../../assets/icons";
import { config } from "../../config";
import { SiteConfigType } from "../../constants/siteConfig.constant";
import { useUpsertSiteConfigByTypeMutation } from "../../services/siteConfig.service";
import { useUploadImageMutation } from "../../services/upload.service";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import UploadImageBox from "../common/UpdloadImageBox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { ModalShared } from "../ui/modal";

const { Title, Text } = Typography;

type IconItem = {
  id: string;
  name: string;
  link: string;
  preview?: string;
};

type ContactIconProps = {
  contacts: SiteConfigItem[];
};

const toPreviewUrl = (item: SiteConfigItem) => {
  const imageUrl = item?.images?.[0]?.url;
  return imageUrl ? config.imageBaseUrl + imageUrl : undefined;
};

export default function ContactIcon({ contacts }: ContactIconProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [imageValue, setImageValue] = useState<File | string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [icons, setIcons] = useState<IconItem[]>([]);
  const [upsertSiteConfigByType, { isLoading: upserting }] = useUpsertSiteConfigByTypeMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();

  const isSaving = upserting || uploading;

  const mappedContacts = useMemo(
    () =>
      contacts.map((item) => ({
        id: item.id,
        name: item.title ?? "",
        link: item.link ?? "",
        preview: toPreviewUrl(item),
      })),
    [contacts],
  );

  useLayoutEffect(() => {
    setIcons(mappedContacts);
  }, [mappedContacts]);

  function resetForm() {
    setName("");
    setLink("");
    setImageValue(null);
    setEditingId(null);
  }

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedLink = link.trim();

    if (!trimmedName) {
      toast.warning("Vui lòng nhập tên icon.");
      return;
    }

    if (!trimmedLink) {
      toast.warning("Vui lòng nhập đường link icon.");
      return;
    }

    try {
      let targetId = editingId;
      let uploadedPreview: string | undefined;

      const upserted = await upsertSiteConfigByType({
        type: SiteConfigType.Contact,
        body: {
          // id: editingId ?? undefined,
          title: trimmedName,
          link: trimmedLink,
        },
      }).unwrap();

      targetId = upserted?.id ?? targetId;

      if (targetId && imageValue instanceof File) {
        const uploaded = await uploadImage({
          files: [imageValue],
          type: "site-config",
          id: targetId,
        }).unwrap();
        const uploadedUrl = uploaded?.data?.[0]?.url;
        if (uploadedUrl) {
          uploadedPreview = config.imageBaseUrl + uploadedUrl;
        }
      }

      if (editingId) {
        setIcons((prev) =>
          prev.map((it) =>
            it.id === editingId
              ? {
                  ...it,
                  name: trimmedName,
                  link: trimmedLink,
                  preview: uploadedPreview ?? it.preview,
                }
              : it,
          ),
        );
        toast.success("Đã cập nhật icon.");
      } else {
        setIcons((prev) => [
          ...prev,
          {
            id: targetId || String(Date.now()),
            name: trimmedName,
            link: trimmedLink,
            preview: uploadedPreview,
          },
        ]);
        toast.success("Đã thêm icon.");
      }

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Đã có lỗi xảy ra.");
    }
  }

  function startEdit(item: IconItem) {
    setEditingId(item.id);
    setName(item.name);
    setLink(item.link);
    setImageValue(item.preview ?? null);
    setOpen(true);
  }

  // Tính năng này chưa có API nên tạm thời bỏ qua
  function handleDelete(item: IconItem) {
    if (!confirm(`Xóa icon "${item.name}" ?`)) return;
    // TODO: gọi API DELETE ở đây trước khi cập nhật state
    setIcons((prev) => prev.filter((it) => it.id !== item.id));
    if (item.preview) URL.revokeObjectURL(item.preview);
    toast.info("Đã xóa icon.");
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-start justify-between w-full">
        <div>
          <Title level={4} className="mb-1">
            Quản lý Icon liên hệ
          </Title>
          <Text type="secondary" className="text-sm">
            Thêm, chỉnh sửa hoặc xóa các Icon liên hệ hiển thị trên Website.
          </Text>
        </div>

        <div className="ml-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            startIcon={<PlusIcon />}
          >
            Thêm Icon liên hệ
          </Button>
        </div>
      </div>

      <div className="w-full border-2 border-dashed rounded-lg min-h-56 p-4 dark:border-gray-700 flex items-center justify-center">
        {icons.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <img
                src="/public/images/empty-state-mail.png"
                alt="empty"
                className="mx-auto mb-3 h-12 w-12"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có icon liên hệ nào</p>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            {icons.map((it) => (
              <div
                key={it.id}
                className="bg-white dark:bg-gray-800 rounded-md p-3 flex flex-col items-center justify-between shadow-sm"
              >
                <div className="flex-1 flex flex-col items-center gap-2">
                  {it.preview ? (
                    <img src={it.preview} alt={it.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                      Icon
                    </div>
                  )}
                  <div className="text-sm font-medium mt-2 text-gray-800 dark:text-gray-100">
                    {it.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                    {it.link}
                  </div>
                </div>

                <div className="mt-3 w-full flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(it)}
                    className="flex-1"
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(it)}
                    className="flex-1"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalShared
        isOpen={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title={editingId ? "Chỉnh sửa Icon liên hệ" : "Thêm Icon liên hệ"}
        isSaving={isSaving}
        onSave={handleSave}
        modalButtonSize="md"
      >
        <div className="space-y-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tên Icon
            </label>
            <Input
              placeholder="Ví dụ: Facebook, Instagram..."
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Hình ảnh Icon
            </label>
            <div className="w-full">
              <UploadImageBox
                value={imageValue}
                onChange={(f: File | null) => setImageValue(f)}
                maxSizeMB={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Đường link
            </label>
            <Input
              placeholder="Ví dụ: https://facebook.com/..."
              value={link}
              onChange={(e: any) => setLink(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </ModalShared>
    </div>
  );
}
