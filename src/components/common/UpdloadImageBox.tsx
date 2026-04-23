import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";

type UploadImageBoxProps = {
  value?: File | string | null;
  onChange?: (file: File | null) => void;
  maxSizeMB?: number;
};

interface PreviewFile {
  file: File | null;
  preview: string;
  isObjectUrl: boolean;
}

const UploadImageBox = ({ value, onChange, maxSizeMB = 5 }: UploadImageBoxProps) => {
  const [preview, setPreview] = useState<PreviewFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** dùng ref để quản lý blob lifecycle */
  const objectUrlRef = useRef<string | null>(null);

  /** ===== cleanup khi unmount ===== */
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  /** ===== sync từ value (CHỈ phụ thuộc value) ===== */
  useEffect(() => {
    if (!value) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreview(null);
      return;
    }

    if (typeof value === "string") {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      setPreview({
        file: null,
        preview: value,
        isObjectUrl: false,
      });
      return;
    }

    if (value instanceof File) {
      const newUrl = URL.createObjectURL(value);

      // revoke blob cũ SAU khi đã có blob mới
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = newUrl;

      setPreview({
        file: value,
        preview: newUrl,
        isObjectUrl: true,
      });
    }
  }, [value]);

  /** ===== drop ===== */
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorCode = rejection.errors?.[0]?.code;

        if (errorCode === "file-too-large") {
          setError(`File size must be less than ${maxSizeMB}MB`);
        } else if (errorCode === "file-invalid-type") {
          setError("Chỉ hỗ trợ file PNG, JPG, WebP, SVG");
        } else {
          setError("File không hợp lệ");
        }
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      /** ❗ chỉ emit ra ngoài, KHÔNG setPreview ở đây */
      onChange?.(file);
    },
    [maxSizeMB, onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    onDragEnter: () => setError(null),
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPreview(null);
    setError(null);
    onChange?.(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /** ===== JSX GIỮ NGUYÊN ===== */
  return (
    <div className="w-full flex-1">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`transition-all border border-dashed cursor-pointer rounded-xl h-full flex flex-col justify-center
            ${
              isDragActive
                ? "border-brand-500 bg-brand-50 dark:bg-gray-800 scale-[1.01]"
                : "border-gray-300 bg-gray-50 hover:border-brand-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500 dark:hover:bg-gray-800"
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center p-7 lg:p-10">
            <FiUpload
              className={`text-2xl mb-4 ${isDragActive ? "text-brand-500 rotate-180 transition-transform duration-200" : "text-gray-500"}`}
            />
            <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl text-center dark:text-white/90">
              {isDragActive ? "Thả ảnh vào đây" : "Kéo thả ảnh vào đây hoặc nhấp để chọn"}
            </h4>

            <span className="text-center mb-5 block w-full max-w-72 text-sm text-gray-500 dark:text-gray-400">
              Hỗ trợ file PNG, JPG, WebP, SVG · Max {maxSizeMB}MB
            </span>

            <span className="font-medium underline text-theme-sm text-brand-500 hover:text-brand-600 transition-colors">
              Chọn từ máy
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
          <div className="relative group bg-gray-100 dark:bg-gray-800 max-h-72 h-72 overflow-hidden">
            <img src={preview.preview} alt="Preview" className="w-full max-h-72 object-contain" />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg font-medium text-sm hover:bg-red-50 hover:text-red-600 transition-colors shadow-md"
              >
                Remove
              </button>
            </div>

            <div className="absolute bottom-0 left-0 p-4 w-full bg-linear-to-t from-black/40 to-transparent">
              <p className="text-sm text-white dark:text-gray-400">
                {preview.file
                  ? `${preview.file.name} · ${formatFileSize(preview.file.size)}`
                  : "Ảnh hiện tại"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-500 flex items-center gap-1">{error}</p>}
    </div>
  );
};

export default UploadImageBox;
