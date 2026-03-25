import { useRef } from "react";
import RichTextEditor from "../../components/common/RichTextEditor";
import Button from "../../components/ui/button/Button";
import "ckeditor5/ckeditor5-content.css";

export default function Blog() {
  const content = useRef("");
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <RichTextEditor
        value={content.current}
        onChange={(data: string) => {
          content.current = data;
          if (previewRef.current) {
            previewRef.current.innerHTML = data;
          }
        }}
      />
      <Button onClick={() => console.log(content.current)} className="mt-6 float-end">
        Save
      </Button>

      <div ref={previewRef} className="ck-content preview mt-20" />
    </div>
  );
}
