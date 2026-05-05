import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import useModal from "antd/es/modal/useModal";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { PlusIcon } from "../../assets/icons";
import { config } from "../../config";
import { SiteConfigType } from "../../constants/siteConfig.constant";
import {
  siteConfigService,
  useCreateSiteConfigMutation,
  useDeleteSiteConfigMutation,
  useUpdateSiteConfigMutation,
} from "../../services/siteConfig.service";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import type { AppDispatch } from "../../store";
import type { SiteConfigItem } from "../../types/siteConfig.type";
import UploadImageBox from "../common/UpdloadImageBox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { ModalShared } from "../ui/modal";

const { Title, Text } = Typography;

type ContactIconProps = {
  contacts: SiteConfigItem[];
};

const toPreviewUrl = (item: SiteConfigItem) => {
  const imageUrl = item?.images?.[0]?.url;
  return imageUrl ? config.imageBaseUrl + imageUrl : undefined;
};

export default function ContactIcon({ contacts }: ContactIconProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [modalDelete, contextHolder] = useModal();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [imageValue, setImageValue] = useState<File | string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [createSiteConfig, { isLoading: creating }] = useCreateSiteConfigMutation();
  const [updateSiteConfig, { isLoading: updating }] = useUpdateSiteConfigMutation();
  const [deleteSiteConfig, { isLoading: deleting }] = useDeleteSiteConfigMutation();
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();
  const [deleteImage, { isLoading: deletingImage }] = useDeleteImageMutation();

  const isSaving = creating || updating || deleting || uploading || deletingImage;

  const mappedContacts = useMemo(() => contacts, [contacts]);

  function patchContactImagesCache(contactId: string, images: SiteConfigItem["images"]) {
    dispatch(
      siteConfigService.util.updateQueryData("getList", {}, (draft: any) => {
        if (!draft?.data) return;
        const target = draft.data.find((item: SiteConfigItem) => item.id === contactId);
        if (!target) return;
        target.images = images ?? [];
      }),
    );
  }

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
      const editingContact = editingId ? contacts.find((item) => item.id === editingId) : null;
      const oldImageId = editingContact?.images?.[0]?.id;

      let targetId = editingId ?? "";

      if (editingId) {
        await updateSiteConfig({
          id: editingId,
          type: SiteConfigType.Contact,
          title: trimmedName,
          link: trimmedLink,
        }).unwrap();
      } else {
        const created = await createSiteConfig({
          type: SiteConfigType.Contact,
          title: trimmedName,
          link: trimmedLink,
        }).unwrap();
        targetId = created.id;
      }

      if (editingId && imageValue === null && oldImageId) {
        await deleteImage({ id: oldImageId }).unwrap();
        patchContactImagesCache(targetId, []);
      }

      if (targetId && imageValue instanceof File) {
        if (oldImageId) {
          await deleteImage({ id: oldImageId }).unwrap();
          patchContactImagesCache(targetId, []);
        }

        const uploaded = await uploadImage({
          files: [imageValue],
          type: "site-config",
          id: targetId,
        }).unwrap();
        patchContactImagesCache(targetId, (uploaded?.data as SiteConfigItem["images"]) ?? []);
      }

      setOpen(false);
      resetForm();
      toast.success(editingId ? "Đã cập nhật icon." : "Đã thêm icon.");
    } catch (err) {
      console.error("Lưu icon liên hệ thất bại:", err);
      toast.error("Không thể lưu icon liên hệ.");
    }
  }

  function startEdit(item: SiteConfigItem) {
    setEditingId(item.id);
    setName(item.title ?? "");
    setLink(item.link ?? "");
    setImageValue(toPreviewUrl(item) ?? null);
    setOpen(true);
  }

  async function handleDelete(item: SiteConfigItem) {
    try {
      const imageId = item.images?.[0]?.id;

      await Promise.all([
        deleteSiteConfig({ id: item.id }).unwrap(),
        imageId ? deleteImage({ id: imageId }).unwrap() : Promise.resolve(),
      ]);

      toast.success("Đã xóa icon.");
    } catch (error) {
      console.error("Xóa icon liên hệ thất bại:", error);
      toast.error("Không thể xóa icon liên hệ.");
    }
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
        {mappedContacts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <img
                src="/images/empty-state-mail.png"
                alt="empty"
                className="mx-auto mb-3 h-12 w-12"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có icon liên hệ nào</p>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            {mappedContacts.map((it) => (
              <div
                key={it.id}
                className="bg-white dark:bg-gray-800 rounded-md p-3 flex flex-col items-center justify-between shadow-sm"
              >
                <div className="flex-1 flex flex-col items-center gap-2">
                  {toPreviewUrl(it) ? (
                    <img
                      src={toPreviewUrl(it)}
                      alt={it.title ?? "Contact icon"}
                      className="h-12 w-12 object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                      Icon
                    </div>
                  )}
                  <div className="text-sm font-medium mt-2 text-gray-800 dark:text-gray-100">
                    {it.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-37.5">
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
                    onClick={() =>
                      modalDelete.confirm({
                        title: "Xác nhận xóa",
                        centered: true,
                        icon: <ExclamationCircleOutlined />,
                        content: "Bạn có chắc chắn muốn xóa ?",
                        okText: "Xóa",
                        cancelText: "Hủy",
                        onOk: () => handleDelete(it),
                      })
                    }
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
      {contextHolder}
    </div>
  );
}
