import { CKEditor } from "@ckeditor/ckeditor5-react";
import { Spin } from "antd";
import {
  Bold,
  ClassicEditor,
  Essentials,
  FileRepository,
  FontSize,
  Heading,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageResizeButtons,
  ImageResizeHandles,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  Table,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { useEffect, useMemo, useRef } from "react";
import { config } from "../../config";
import { useDeleteImageMutation, useUploadImageMutation } from "../../services/upload.service";
import "../../styles/rich-text-editor.css";
import { createUploadAdapterPlugin } from "../../utils/richTextEditor.adapter";

interface RichTextEditorProps {
  value?: string;
  onChange?: (data: string) => void;
  uploadUrl?: string;
  uploadHeaders?: Record<string, string>;
  imageIds?: string[];
  ownerId?: number | string;
  type: string;
}

export default function RichTextEditor({
  value,
  onChange,
  imageIds,
  ownerId,
  type,
}: RichTextEditorProps) {
  const currentImages = useRef<Set<string>>(new Set());
  const hasCleanedUp = useRef(false);

  const [uploadImage, { isLoading: updatingImage }] = useUploadImageMutation();
  const [removeImage] = useDeleteImageMutation();

  // ─── Cleanup ảnh rác khi mount ──────────────────────────────────────────────
  useEffect(() => {
    if (hasCleanedUp.current) return;
    if (!imageIds?.length) return;
    if (value === undefined) return;

    hasCleanedUp.current = true;

    // Parse id đang được dùng trong content
    const matches = [...(value || "").matchAll(/src="([^"]+)"/g)];
    const usedIds = new Set(matches.map((m) => m[1].split("/").pop()));

    // Id nào không được dùng → xóa
    const unusedIds = imageIds.filter((id) => !usedIds.has(id));
    if (unusedIds.length > 0) {
      handleRemove(unusedIds);
    }
  }, [value, imageIds]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleUpload = async (file: File): Promise<string | undefined> => {
    try {
      const { data: uploadResult } = await uploadImage({
        files: [file],
        id: ownerId!,
        type,
      }).unwrap();

      const uploadedUrl = config.imageBaseUrl + uploadResult[0]?.url || "";
      return uploadedUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleRemove = async (ids: string[]) => {
    try {
      await Promise.allSettled(ids.map((id) => removeImage({ id }).unwrap()));
    } catch (error) {
      console.error("Error removing image:", error);
    }
  };

  const uploadAdapterPlugin = useMemo(
    () => createUploadAdapterPlugin(handleUpload),
    [ownerId, type],
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="rich-text-editor">
      {updatingImage && (
        <div className="flex items-center gap-2 text-sm text-blue-500 mb-2">
          <Spin size="small" />
          <span>Đang tải ảnh lên...</span>
        </div>
      )}

      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          licenseKey: "GPL",
          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "fontSize",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "link",
            "insertTable",
            "mediaEmbed",
            "insertImage",
            "|",
            "bulletedList",
            "numberedList",
            "indent",
            "outdent",
          ],
          plugins: [
            Bold,
            Italic,
            Underline,
            Essentials,
            Heading,
            Indent,
            IndentBlock,
            Link,
            List,
            MediaEmbed,
            Paragraph,
            Table,
            Undo,
            Image,
            ImageCaption,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            ImageInsert,
            ImageResize,
            ImageResizeHandles,
            ImageResizeButtons,
            FileRepository,
            FontSize,
            uploadAdapterPlugin,
          ],
          fontSize: {
            options: ["default", 10, 12, 14, 18, 20, 24, 28, 32, 36],
            supportAllValues: true,
          },
          image: {
            resizeOptions: [
              { name: "resizeImage:original", value: null, label: "Original", icon: "original" },
              { name: "resizeImage:25", value: "25", label: "25%", icon: "small" },
              { name: "resizeImage:50", value: "50", label: "50%", icon: "medium" },
              { name: "resizeImage:75", value: "75", label: "75%", icon: "large" },
            ],
            resizeUnit: "%" as const,
            toolbar: [
              "imageStyle:inline",
              "imageStyle:alignLeft",
              "imageStyle:alignCenter",
              "imageStyle:alignRight",
              "imageStyle:block",
              "imageStyle:side",
              "|",
              "toggleImageCaption",
              "imageTextAlternative",
              "|",
              "resizeImage:25",
              "resizeImage:50",
              "resizeImage:75",
              "resizeImage:original",
            ],
            insert: { integrations: ["upload", "url"] },
          },
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          const matches = [...data.matchAll(/src="([^"]+)"/g)];
          currentImages.current = new Set(matches.map((m) => m[1]));
          onChange?.(data);
        }}
      />
    </div>
  );
}
