import { Drawer, Pagination } from "antd";
import { useRef, useState } from "react";
import { CiFilter, CiSearch } from "react-icons/ci";
import { PlusIcon } from "../../assets/icons";
import type { RowKeyType, TableAlign, TableProps } from "../../types/table.type";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table/index";
import TableEmpty from "./TableEmpty";
import TableLoadingAnimate from "./TableLoadingAnimate";

const getAlignClass = (align?: TableAlign) => {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
};

function getRowKey<T>(record: T, rowKey: RowKeyType<T>): string | number {
  if (typeof rowKey === "function") return rowKey(record);
  return record[rowKey] as string | number;
}

function TableShared<TRow>({
  dataSource = [],
  columns = [],
  rowKey = "id" as RowKeyType<TRow>,
  search,
  buttonAdd = { show: true, text: "Thêm mới", onAdd: () => {} },
  pagination,
  loading = false,
  className = "",
  topRightComponent,
}: TableProps<TRow>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterBtnRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      className={`space-y-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3 sm:p-6 ${className}`}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-auto">
          {buttonAdd.show && (
            <Button size="md" onClick={buttonAdd.onAdd} endIcon={<PlusIcon className="size-4" />}>
              {buttonAdd.text}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto md:flex-row flex-row-reverse">
          <div className="">
            <div className="md:flex hidden items-center">{topRightComponent}</div>
            {topRightComponent && (
              <div className="md:hidden inline-flex" ref={filterBtnRef}>
                <Button variant="outline" onClick={() => setDrawerOpen(true)}>
                  <CiFilter className="text-[22px]" />
                </Button>
              </div>
            )}
          </div>
          {search?.enableSearch && (
            <div className="relative w-full md:w-auto">
              <CiSearch
                className="absolute z-30 -translate-y-1/2 cursor-pointer left-4 top-1/2 text-gray-600 dark:text-gray-400"
                size={20}
              />
              <Input
                type="text"
                id="tabelSearchbox"
                value={search.searchValue}
                onChange={(e) => search.onSearch(e.target.value)}
                placeholder={search.placeholder}
                className="xl:w-80! w-full! px-10"
              />
            </div>
          )}
        </div>
      </div>

      {topRightComponent && (
        <Drawer
          placement="bottom"
          closable
          onClose={() => {
            setDrawerOpen(false);
            setTimeout(() => {
              filterBtnRef.current?.querySelector("button")?.focus();
            }, 0);
          }}
          open={drawerOpen}
        >
          <div className="">{topRightComponent}</div>
        </Drawer>
      )}

      {/* ── CARD VIEW (mobile & tablet < md) ── */}
      <div className="md:hidden space-y-3">
        {loading && <TableLoadingAnimate />}

        {!loading && dataSource.length === 0 && <TableEmpty />}

        {!loading &&
          dataSource.map((row, rowIndex) => (
            <div
              key={getRowKey(row, rowKey) ?? rowIndex}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2"
            >
              {columns.map((column) => {
                if (column.hideOnMobile) return null;

                const value = column.render
                  ? column.render(row, rowIndex)
                  : String(row[column.key as keyof TRow] ?? "-");

                return (
                  <div
                    key={String(column.key)}
                    className={`flex items-start justify-between gap-2 text-sm ${column.cardFullWidth ? "flex-col" : ""}`}
                  >
                    <span className="shrink-0 font-medium text-gray-800 dark:text-gray-400">
                      {column.title}
                    </span>
                    <span
                      className={`text-gray-800 dark:text-gray-200 ${column.cardFullWidth ? "w-full" : "text-right"}`}
                    >
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
      </div>

      {/* ── TABLE VIEW (desktop >= md) ── */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <Table className="text-sm">
            <TableHeader className="bg-gray-100 dark:bg-white/5 h-14 text-[16px]">
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    isHeader
                    className={`px-4 py-3 font-medium text-gray-700 dark:text-gray-300 ${getAlignClass(column.align)} ${column.headerClassName ?? ""}`}
                  >
                    {column.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <td colSpan={columns.length} className="px-0 py-0">
                    <TableLoadingAnimate />
                  </td>
                </TableRow>
              )}

              {!loading &&
                dataSource.length > 0 &&
                dataSource.map((row, rowIndex) => (
                  <TableRow
                    key={getRowKey(row, rowKey) ?? rowIndex}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={String(column.key)}
                        className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${getAlignClass(column.align)} ${column.cellClassName ?? ""}`}
                      >
                        {column.render
                          ? column.render(row, rowIndex)
                          : String(row[column.key as keyof TRow] ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!loading && dataSource.length === 0 && (
                <TableRow>
                  <td colSpan={columns.length} className="px-0 py-0">
                    <TableEmpty />
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-end">
          <Pagination {...pagination} total={pagination?.totalItem} />
        </div>
      )}
    </div>
  );
}

export default TableShared;
