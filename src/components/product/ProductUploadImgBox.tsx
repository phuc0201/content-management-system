import type { UploadFile } from "antd";
import { Image, Modal, Upload } from "antd";
import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import { config } from "../../config";
import { productService } from "../../services/product.service";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import type { ProductImage } from "../../types/product.type";
import ComponentCard from "../common/ComponentCard";
import { useDispatch } from "react-redux";

interface ProductUploadImgBoxProps {
  productId?: number;
  imageUrls?: ProductImage[];
  onUploadSuccess?: (urls: string[]) => void;
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

export default function ProductUploadImgBox({
  productId,
  imageUrls = [],
  onUploadSuccess,
}: ProductUploadImgBoxProps) {
  const dispatch = useDispatch();
  const [fileList, setFileList] = useState<UploadFile[]>(() => toUploadFiles(imageUrls));
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [uploadImage] = useUploadImageMutation();
  const [deleteImage] = useDeleteImageMutation();

  useEffect(() => {
    if (imageUrls.length > 0) {
      setFileList(toUploadFiles(imageUrls));
    }
  }, [imageUrls]);

  const handlePreview = (file: UploadFile) => {
    const src = file.url ?? file.thumbUrl ?? file.response?.url ?? "";
    setPreviewUrl(src);
    setPreviewOpen(true);
  };

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
        productService.util.updateQueryData('getById', productId!, (draft: any) => {
          if (draft?.data?.images) {
            draft.data.images.push(imgs[0]);
          }
        }) as any
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

  const handleChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  return (
    <ComponentCard>
      <div className="flex flex-col gap-3">
        {/* <div className="flex-1">
          <img src={fileList[0]?.url} alt="" className="h-full object-contain max-h-100" />
        </div> */}

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
