import { Modal } from "antd";
import type { CSSProperties, ReactNode } from "react";
import type { ModalProps as AntModalProps } from "antd";

type ModalButtonSize = "sm" | "md";

const MODAL_BUTTON_SIZE_STYLES: Record<ModalButtonSize, CSSProperties> = {
  sm: {
    minHeight: 36,
    paddingInline: 16,
    fontSize: 14,
    borderRadius: 8,
  },
  md: {
    minHeight: 40,
    paddingInline: 20,
    fontSize: 14,
    borderRadius: 8,
  },
};

interface ModalSharedProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  className?: string;
  children: ReactNode;
  width?: number | string;
  extraProps?: Omit<
    AntModalProps,
    | "open"
    | "onCancel"
    | "onOk"
    | "className"
    | "width"
    | "title"
    | "okText"
    | "cancelText"
    | "confirmLoading"
    | "children"
  >;
  showSaveButton?: boolean;
  title?: string;
  isSaving?: boolean;
  modalButtonSize?: ModalButtonSize;
}

export const ModalShared = ({
  isOpen,
  onClose,
  onSave,
  children,
  className,
  width = 600,
  extraProps = {},
  showSaveButton = true,
  title = "Modal Title",
  isSaving = false,
  modalButtonSize = "md",
}: ModalSharedProps) => {
  const buttonSizeStyle = MODAL_BUTTON_SIZE_STYLES[modalButtonSize];

  const mergedOkButtonProps: AntModalProps["okButtonProps"] = {
    ...(extraProps.okButtonProps ?? {}),
    style: {
      ...buttonSizeStyle,
      ...((extraProps.okButtonProps?.style as CSSProperties | undefined) ?? {}),
      ...(showSaveButton
        ? {}
        : {
            display: "none",
          }),
    },
  };

  const mergedCancelButtonProps: AntModalProps["cancelButtonProps"] = {
    ...(extraProps.cancelButtonProps ?? {}),
    style: {
      ...buttonSizeStyle,
      ...((extraProps.cancelButtonProps?.style as CSSProperties | undefined) ?? {}),
    },
  };

  return (
    <Modal
      {...extraProps}
      open={isOpen}
      onCancel={onClose}
      centered
      width={width}
      className={`custom-modal ${className || ""} select-none`}
      title={title}
      destroyOnHidden
      okText={"Lưu"}
      cancelText={"Hủy"}
      confirmLoading={isSaving}
      onOk={onSave}
      okButtonProps={mergedOkButtonProps}
      cancelButtonProps={mergedCancelButtonProps}
    >
      {children}
    </Modal>
  );
};
