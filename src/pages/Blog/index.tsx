import "ckeditor5/ckeditor5-content.css";
import { useRef } from "react";
import RichTextEditor from "../../components/common/RichTextEditor";
import Button from "../../components/ui/button/Button";
import { useGetBlogsQuery } from "../../services/blog.service";

export default function Blog() {
  const content = useRef("");
  const previewRef = useRef<HTMLDivElement>(null);

  const { data: blogRes } = useGetBlogsQuery({ pagination: { current: 1, pageSize: 10 } });
  console.log("🚀 ~ Blog ~ blogRes:", blogRes);

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
