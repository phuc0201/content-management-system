import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

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

  const releasePreview = useCallback(() => {
    if (preview?.isObjectUrl) {
      URL.revokeObjectURL(preview.preview);
    }
  }, [preview]);

  useEffect(() => {
    return () => {
      releasePreview();
    };
  }, [releasePreview]);

  useEffect(() => {
    if (!value) {
      releasePreview();
      setPreview(null);
      return;
    }

    if (typeof value === "string") {
      if (preview?.preview === value && !preview.isObjectUrl) return;
      releasePreview();
      setPreview({ file: null, preview: value, isObjectUrl: false });
      return;
    }

    if (value instanceof File) {
      if (preview?.file === value) return;
      const objectUrl = URL.createObjectURL(value);
      releasePreview();
      setPreview({ file: value, preview: objectUrl, isObjectUrl: true });
    }
  }, [preview, releasePreview, value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      releasePreview();
      setPreview({ file, preview: objectUrl, isObjectUrl: true });
      onChange?.(file);
    },
    [maxSizeMB, onChange, releasePreview],
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
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    releasePreview();
    setPreview(null);
    setError(null);
    onChange?.(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
            <div className="mb-5 flex justify-center">
              <div
                className={`flex h-17 w-17 items-center justify-center rounded-full transition-colors
                  ${
                    isDragActive
                      ? "bg-brand-100 text-brand-500 dark:bg-brand-900"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
              >
                <svg
                  className="fill-current"
                  width="29"
                  height="28"
                  viewBox="0 0 29 28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                  />
                </svg>
              </div>
            </div>

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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
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

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default UploadImageBox;
