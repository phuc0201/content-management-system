import type { UploadFile } from "antd";
import { Image, Modal, Typography, Upload } from "antd";
import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import { useDispatch } from "react-redux";
import { config } from "../../config";
import { productService } from "../../services/product.service";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import type { ProductImage } from "../../types/product.type";
import ComponentCard from "../common/ComponentCard";

const { Text } = Typography;

interface ProductUploadImgBoxProps {
  productId?: number;
  imageUrls?: ProductImage[];
  thumbnailUrl?: string;
  onUploadSuccess?: (urls: string[]) => void;
  onThumbnailUploadSuccess?: (url: string) => void;
}

const toUploadFiles = (images: ProductImage[]): UploadFile[] =>
  images.map((img) => ({
    uid: img.id ?? img.url ?? Math.random().toString(),
    name: img.alt ?? img.filePath ?? "image",
    status: "done",
    url: config.imageBaseUrl + img.url,
    thumbUrl: config.imageBaseUrl + img.url,
    response: { url: img.url },
  }));

const toThumbnailUploadFile = (image: ProductImage): UploadFile => ({
  uid: image.id ?? image.url ?? Math.random().toString(),
  name: image.alt ?? image.filePath ?? "thumbnail",
  status: "done",
  url: config.imageBaseUrl + image.url,
  thumbUrl: config.imageBaseUrl + image.url,
  response: { url: image.url },
});

export default function ProductUploadImgBox({
  productId,
  imageUrls = [],
  thumbnailUrl = "",
  onUploadSuccess,
  onThumbnailUploadSuccess,
}: ProductUploadImgBoxProps) {
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState<UploadFile[]>(() => toUploadFiles(imageUrls));
  const [thumbnailFileList, setThumbnailFileList] = useState<UploadFile[]>(() =>
    thumbnailUrl ? [toThumbnailUploadFile({ url: thumbnailUrl })] : [],
  );
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [uploadImage] = useUploadImageMutation();
  const [deleteImage] = useDeleteImageMutation();

  useEffect(() => {
    if (imageUrls.length > 0) {
      setFileList(toUploadFiles(imageUrls));
    }
  }, [imageUrls]);

  useEffect(() => {
    if (thumbnailUrl) {
      setThumbnailFileList([toThumbnailUploadFile({ url: thumbnailUrl })]);
    } else {
      setThumbnailFileList([]);
    }
  }, [thumbnailUrl]);

  const handlePreview = (file: UploadFile) => {
    const src = file.url ?? file.thumbUrl ?? file.response?.url ?? "";
    setPreviewUrl(src);
    setPreviewOpen(true);
  };

  // Upload handler for product images
  const handleUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const { data: imgs } = await uploadImage({
        files: [file],
        id: productId!,
        type: "product",
      }).unwrap();

      if (imgs.length === 0) {
        throw new Error("No images returned from upload");
      }

      const url = config.imageBaseUrl + imgs[0]?.url;
      onSuccess({ url }, file);

      dispatch(
        productService.util.updateQueryData("getById", productId!, (draft: any) => {
          if (draft?.data?.images) {
            draft.data.images.push(imgs[0]);
          }
        }) as any,
      );

      setFileList((prev) => {
        const next = prev.map((f) =>
          f.uid === file.uid ? { ...f, status: "done" as const, url, response: { url } } : f,
        );
        onUploadSuccess?.(next.map((f) => f.url!).filter(Boolean));
        return next;
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      onError(error);
    }
  };

  // Upload handler for thumbnail
  const handleThumbnailUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const { data: imgs } = await uploadImage({
        files: [file],
        id: productId!,
        type: "prod-thumb",
      }).unwrap();

      if (imgs.length === 0) {
        throw new Error("No thumbnail returned from upload");
      }

      const url = config.imageBaseUrl + imgs[0]?.url;
      onSuccess({ url }, file);

      dispatch(
        productService.util.updateQueryData("getById", productId!, (draft: any) => {
          if (draft?.data?.images) {
            draft.data.images = draft.data.images.filter((img: any) => img.scope !== "prod-thumb");
            draft.data.images.push(imgs[0]);
          }
        }) as any,
      );

      setThumbnailFileList([
        {
          uid: imgs[0]?.id ?? imgs[0]?.url ?? file.uid,
          name: imgs[0]?.alt ?? imgs[0]?.filePath ?? "thumbnail",
          status: "done",
          url,
          thumbUrl: url,
          response: { url },
        },
      ]);

      onThumbnailUploadSuccess?.(url);
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      onError(error);
    }
  };

  // Remove handler for product images
  const handleRemove = (file: UploadFile) => {
    return new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: "Xóa ảnh",
        content: "Bạn có chắc muốn xóa ảnh này không?",
        okText: "Xóa",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        onOk: async () => {
          await deleteImage({ id: file.uid });
          dispatch(
            productService.util.updateQueryData("getById", productId!, (draft: any) => {
              if (draft?.data?.images) {
                draft.data.images = draft.data.images.filter((img: any) => img.id !== file.uid);
              }
            }) as any,
          );

          setFileList((prev) => {
            const next = prev.filter((f) => f.uid !== file.uid);
            onUploadSuccess?.(next.map((f) => f.url!).filter(Boolean));
            return next;
          });
          resolve(true);
        },
        onCancel: () => resolve(false),
      });
    });
  };

  // Remove handler for thumbnail
  const handleThumbnailRemove = (file: UploadFile) => {
    return new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: "Xóa ảnh thumbnail",
        content: "Bạn có chắc muốn xóa ảnh thumbnail này không?",
        okText: "Xóa",
        cancelText: "Hủy",
        okButtonProps: { danger: true },
        onOk: async () => {
          await deleteImage({ id: file.uid });
          dispatch(
            productService.util.updateQueryData("getById", productId!, (draft: any) => {
              if (draft?.data?.images) {
                draft.data.images = draft.data.images.filter((img: any) => img.id !== file.uid);
              }
            }) as any,
          );

          setThumbnailFileList([]);
          onThumbnailUploadSuccess?.("");
          resolve(true);
        },
        onCancel: () => resolve(false),
      });
    });
  };

  const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const handleThumbnailChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setThumbnailFileList(newFileList);
  };

  return (
    <ComponentCard>
      <div className="flex flex-col gap-5">
        {/* Thumbnail Upload Section */}
        <div className="flex flex-col gap-2">
          <Text strong>Ảnh thumbnail</Text>
          <Text type="secondary" className="text-xs">
            Ảnh đại diện hiển thị chính của sản phẩm (tối đa 1 ảnh)
          </Text>
          <Upload
            listType="picture-card"
            customRequest={handleThumbnailUpload}
            onRemove={handleThumbnailRemove}
            onChange={handleThumbnailChange}
            onPreview={handlePreview}
            fileList={thumbnailFileList}
            maxCount={1}
            accept="image/*"
          >
            {thumbnailFileList.length < 1 && <GoPlus className="text-xl opacity-80" />}
          </Upload>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Product Images Upload Section */}
        <div className="flex flex-col gap-2">
          <Text strong>Ảnh sản phẩm</Text>
          <Text type="secondary" className="text-xs">
            Tải lên nhiều ảnh chi tiết của sản phẩm
          </Text>
          <Upload
            listType="picture-card"
            customRequest={handleUpload}
            onRemove={handleRemove}
            onChange={handleChange}
            onPreview={handlePreview}
            fileList={fileList}
            multiple
            accept="image/*"
          >
            <GoPlus className="text-xl opacity-80" />
          </Upload>
        </div>

        {previewUrl && (
          <Image
            src={previewUrl}
            style={{ display: "none" }}
            preview={{
              open: previewOpen,
              src: previewUrl,
              onOpenChange: (open) => setPreviewOpen(open),
            }}
          />
        )}
      </div>
    </ComponentCard>
  );
}
