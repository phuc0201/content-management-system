import type { ReactNode } from "react";
import { Popconfirm } from "antd";
import { CiTrash } from "react-icons/ci";
import { MdEdit } from "react-icons/md";

type Resolver<TRow> = boolean | ((row: TRow) => boolean);

export type ActionKey = "edit" | "delete" | (string & {});

export interface ActionDescriptor<TRow, TKey extends string = ActionKey> {
  key: TKey;
  label?: string;
  icon?: ReactNode;
  className?: string;
  visible?: Resolver<TRow>;
  disabled?: Resolver<TRow>;
  confirm?:
    | boolean
    | {
        title?: string;
        message?: string;
      };
  onClick?: (row: TRow) => void | Promise<void>;
}

export type ActionRegistry<TRow, TKey extends string = ActionKey> = Partial<
  Record<TKey, (ctx: { row: TRow; action: ActionDescriptor<TRow, TKey> }) => void | Promise<void>>
>;

export interface ActionButtonsProps<TRow, TKey extends string = ActionKey> {
  record: TRow;
  actions?: Array<ActionDescriptor<TRow, TKey>>;
  registry?: ActionRegistry<TRow, TKey>;
  onAction?: (key: TKey, row: TRow) => void | Promise<void>;
  className?: string;
  buttonClassName?: string;
  confirmHandler?: (action: ActionDescriptor<TRow, TKey>, row: TRow) => boolean | Promise<boolean>;
}

const DEFAULT_ACTIONS: Array<ActionDescriptor<unknown, ActionKey>> = [
  { key: "edit" },
  { key: "delete" },
];

function resolveBoolean<TRow>(
  resolver: Resolver<TRow> | undefined,
  row: TRow,
  defaultValue: boolean,
) {
  if (typeof resolver === "function") return resolver(row);
  if (typeof resolver === "boolean") return resolver;
  return defaultValue;
}

function getDefaultIcon(key: string): ReactNode {
  if (key === "edit") return <MdEdit />;
  if (key === "delete") return <CiTrash />;
  return null;
}

function getDefaultClass(key: string): string {
  if (key === "edit") {
    return "text-xl w-10 h-10 rounded-md flex items-center justify-center text-gray-300 hover:bg-brand-400 dark:hover:bg-gray-700 bg-brand-500";
  }

  if (key === "delete") {
    return "text-xl w-10 h-10 rounded-md flex items-center justify-center text-red-500 dark:text-gray-400 dark:hover:bg-gray-700 border border-red-200";
  }

  return "text-sm min-w-10 h-10 px-3 rounded-md flex items-center justify-center border border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800";
}

async function defaultConfirm<TRow, TKey extends string>(
  _action: ActionDescriptor<TRow, TKey>,
  _row: TRow,
) {
  return true;
}

function shouldUsePopconfirm<TRow, TKey extends string>(action: ActionDescriptor<TRow, TKey>) {
  return action.confirm !== false;
}

function getPopconfirmContent<TRow, TKey extends string>(action: ActionDescriptor<TRow, TKey>) {
  if (typeof action.confirm === "object") {
    return {
      title: action.confirm.title || "Xác nhận thao tác",
      description: action.confirm.message,
    };
  }

  return {
    title: "Xác nhận thao tác",
    description: "Bạn có chắc chắn muốn thực hiện hành động này?",
  };
}

export function ActionButtons<TRow, TKey extends string = ActionKey>({
  record,
  actions,
  registry,
  onAction,
  className = "",
  buttonClassName = "",
  confirmHandler,
}: ActionButtonsProps<TRow, TKey>) {
  const actionList = (actions ?? (DEFAULT_ACTIONS as Array<ActionDescriptor<TRow, TKey>>)).filter(
    (action) => resolveBoolean(action.visible, record, true),
  );

  const runAction = async (action: ActionDescriptor<TRow, TKey>) => {
    const isAllowed = confirmHandler
      ? await confirmHandler(action, record)
      : await defaultConfirm(action, record);

    if (!isAllowed) return;

    if (action.onClick) {
      await action.onClick(record);
      return;
    }

    const registryHandler = registry?.[action.key];
    if (registryHandler) {
      await registryHandler({ row: record, action });
      return;
    }

    await onAction?.(action.key, record);
  };

  return (
    <div className={`flex items-center gap-2 justify-center ${className}`}>
      {actionList.map((action) => {
        const isDisabled = resolveBoolean(action.disabled, record, false);
        const icon = action.icon ?? getDefaultIcon(action.key);
        const mergedClassName = `${getDefaultClass(action.key)} ${buttonClassName} ${action.className ?? ""}`;
        const hasPopconfirm = shouldUsePopconfirm(action);

        const actionButton = (
          <button
            type="button"
            onClick={hasPopconfirm ? undefined : () => void runAction(action)}
            disabled={isDisabled}
            aria-label={action.label ?? action.key}
            title={action.label ?? action.key}
            className={`${mergedClassName} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {icon ?? action.label ?? action.key}
          </button>
        );

        if (!hasPopconfirm) {
          return <div key={action.key}>{actionButton}</div>;
        }

        const { title, description } = getPopconfirmContent(action);

        return (
          <Popconfirm
            key={action.key}
            title={title}
            description={description}
            okText="Xác nhận"
            cancelText="Hủy"
            disabled={isDisabled}
            placement="topRight"
            onConfirm={() => runAction(action)}
          >
            <span>{actionButton}</span>
          </Popconfirm>
        );
      })}
    </div>
  );
}
