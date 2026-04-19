import type { Editor } from "ckeditor5";

type UploadFn = (file: File) => Promise<any>;

class CustomUploadAdapter {
  private loader: any;
  private uploadFn: UploadFn;

  constructor(loader: any, uploadFn: UploadFn) {
    this.loader = loader;
    this.uploadFn = uploadFn;
  }

  async upload() {
    const file = await this.loader.file;
    const url = await this.uploadFn(file);
    if (!url) throw new Error("Upload failed");
    return { default: url };
  }

  abort() {}
}

export function createUploadAdapterPlugin(uploadFn: UploadFn) {
  return function CustomUploadAdapterPlugin(editor: Editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return new CustomUploadAdapter(loader, uploadFn);
    };
  };
}
