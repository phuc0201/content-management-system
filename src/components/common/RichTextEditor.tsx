import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
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
  SimpleUploadAdapter,
  FontSize,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "../../styles/rich-text-editor.css";
import { getAccessToken } from "../../utils/authHelpers";

interface RichTextEditorProps {
  value?: string;
  onChange?: (data: string) => void;
  uploadUrl?: string;
  uploadHeaders?: Record<string, string>;
}

export default function RichTextEditor({
  value,
  onChange,
  uploadUrl = "/api/upload/image",
  uploadHeaders = {},
}: RichTextEditorProps) {
  return (
    <div className="rich-text-editor">
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
            SimpleUploadAdapter,
            FontSize,
          ],
          fontSize: {
            options: ["default", 10, 12, 14, 18, 20, 24, 28, 32, 36],
            supportAllValues: true,
          },
          image: {
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
            ],
            insert: {
              integrations: ["upload", "url"],
            },
          },
          simpleUpload: {
            uploadUrl,
            headers: { ...uploadHeaders, Authorization: `Bearer ${getAccessToken()}` },
          },
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange?.(data);
        }}
      />
    </div>
  );
}
