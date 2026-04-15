import type { ReactNode } from "react";
export type TableAlign = "left" | "center" | "right";

export type RowKeyType<TRow> = keyof TRow | ((record: TRow) => string | number);

export interface TableCol<TRow> {
  key: keyof TRow | string;
  title: string;
  align?: TableAlign;
  width?: number | string;
  headerClassName?: string;
  cellClassName?: string;
  hideOnMobile?: boolean;
  cardFullWidth?: boolean;
  render?: (row: TRow, index?: number) => ReactNode;
}

export interface TableAction<TRow> {
  key: string;
  onClick?: (row?: TRow) => void;
  icon?: ReactNode;
  isConfirm?: boolean;
  className?: string;
}

export interface TableSearch {
  enableSearch: boolean;
  searchValue: string;
  searchKey: string;
  placeholder: string;
  onSearch: (value: string) => void;
}

export interface TablePagination {
  current: number;
  pageSize?: number;
  totalPage: number;
  totalItem: number;
  showSizeChanger?: boolean;
  pageSizeOptions: number[];
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableProps<TRow> {
  dataSource: TRow[];
  columns: TableCol<TRow>[];
  rowKey: RowKeyType<TRow>;

  search?: TableSearch;

  buttonAdd?: {
    show: boolean;
    text: string;
    isLoading?: boolean;
    onAdd: () => void;
  };

  pagination?: TablePagination;

  loading?: boolean;
  fetching?: boolean;

  className?: string;

  topRightComponent?: ReactNode;
}
