import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal, Typography } from "antd";
import { useState } from "react";
import { toast } from "react-toastify";
import { PlusIcon } from "../../assets/icons";
import { config } from "../../config";
import useModal from "../../hooks/useModal";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import type { SiteConfigImage, SiteConfigItem } from "../../types/siteConfig.type";
import UploadImageBox from "../common/UpdloadImageBox";
import Button from "../ui/button/Button";
import { ModalShared } from "../ui/modal";

const { Title, Text } = Typography;

type HomeBannerProps = {
  homeBanner: SiteConfigItem | null;
};

export default function HomeBanner({ homeBanner }: HomeBannerProps) {
  const [modalDelete, contextHolder] = Modal.useModal();

  const {
    openModal,
    closeModal,
    open: isModalOpen,
    data: imageEditing,
  } = useModal<SiteConfigImage | null>();

  const [selectedImage, setSelectedImage] = useState<File | string | null>(null);

  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteImageMutation();

  const isSaving = isUploading || isDeleting;
  const bannerId = homeBanner?.id ?? "";

  const getImageUrl = (imageUrl: string) => {
    return imageUrl ? config.imageBaseUrl + imageUrl : "";
  };

  const handleSave = async () => {
    if (!selectedImage) {
      toast.warning("Vui lòng chọn ảnh trước khi lưu.");
      return;
    }

    try {
      if (selectedImage instanceof File && !imageEditing) {
        await uploadImage({
          files: [selectedImage],
          id: bannerId as string,
          type: "site-config",
          siteConfigId: bannerId,
          quality: 1,
        }).unwrap();
        toast.success("Lưu ảnh banner thành công.");
      } else if (imageEditing?.id && selectedImage instanceof File) {
        await deleteImage({ id: imageEditing.id, siteConfigId: bannerId }).unwrap();
        await uploadImage({
          files: [selectedImage],
          id: bannerId as string,
          type: "site-config",
          siteConfigId: bannerId,
          quality: 1,
        }).unwrap();
        toast.success("Cập nhật ảnh banner thành công.");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Lưu ảnh banner thất bại:", error);
      toast.error("Không thể lưu ảnh banner. Vui lòng thử lại.");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!bannerId) {
      toast.error("Không tìm thấy ID banner.");
      return;
    }

    try {
      await deleteImage({ id: imageId, siteConfigId: bannerId }).unwrap();
      toast.success("Xóa ảnh banner thành công.");
    } catch (error) {
      console.error("Xóa ảnh banner thất bại:", error);
      toast.error("Không thể xóa ảnh banner. Vui lòng thử lại.");
    }
  };

  const handleEditClick = (image: NonNullable<SiteConfigItem["images"]>[number]) => {
    if (!image?.id) return;
    openModal(image);
    setSelectedImage(image.url!);
  };

  const handleCloseModal = () => {
    closeModal();
    setSelectedImage(null);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-start justify-between w-full">
        <div>
          <Title level={4} className="mb-1">
            Quản lý ảnh banner trang chủ
          </Title>
          <Text type="secondary" className="text-sm">
            Thêm, chỉnh sửa hoặc xóa các ảnh banner hiển thị trên trang chủ.
          </Text>
        </div>

        <div className="ml-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openModal(null)}
            startIcon={<PlusIcon />}
          >
            Thêm
          </Button>
        </div>
      </div>

      <div className="w-full border-2 border-dashed rounded-lg min-h-80 p-4 dark:border-gray-700 flex items-center justify-center">
        {(homeBanner?.images || []).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <img
                src="/images/empty-state-mail.png"
                alt="empty"
                className="mx-auto mb-3 h-12 w-12"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có ảnh banner nào</p>
            </div>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(homeBanner?.images || [])?.map((image: SiteConfigImage) => (
              <div
                key={image?.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm flex flex-col"
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={getImageUrl(image.url!)}
                    alt={`Banner ${image?.index ?? 0}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3 flex flex-col items-start gap-2">
                  {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                    STT: <span className="font-medium">{image.index ?? 0}</span>
                  </div> */}
                  <div className="w-full flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(image)}
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
                          content: "Bạn có chắc chắn muốn xóa ảnh banner này?",
                          okText: "Xóa",
                          cancelText: "Hủy",
                          onOk: () => handleDeleteImage(image.id!),
                        })
                      }
                      className="flex-1"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ModalShared
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={false ? "Thay đổi ảnh banner" : "Thêm ảnh banner"}
        isSaving={isSaving}
        onSave={handleSave}
        modalButtonSize="md"
      >
        <div className="space-y-4 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {false ? "Chọn ảnh mới" : "Chọn ảnh banner"}
            </label>
            <div className="w-full">
              <UploadImageBox
                value={
                  selectedImage instanceof File
                    ? selectedImage
                    : getImageUrl(selectedImage as string)
                }
                onChange={(f: File | null) => setSelectedImage(f)}
                maxSizeMB={10}
              />
            </div>
            <Text type="secondary" className="text-xs mt-2 block">
              Kích thước đề xuất: 1920 × 800 px · Tối đa 10 MB
            </Text>
          </div>
        </div>
      </ModalShared>
      {contextHolder}
    </div>
  );
}
