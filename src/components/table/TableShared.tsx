import { Drawer, Pagination, Spin } from "antd";
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
  buttonAdd = { show: true, text: "Thêm mới", isLoading: false, onAdd: () => {} },
  pagination,
  loading = false,
  fetching = false,
  className = "",
  topRightComponent,
  cardConfig,
}: TableProps<TRow>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterBtnRef = useRef<HTMLDivElement | null>(null);

  const isInitialLoading = loading;

  return (
    <div
      className={`space-y-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3 sm:p-6 ${className}`}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:w-auto">
          {buttonAdd.show && (
            <Button
              size="md"
              onClick={buttonAdd.onAdd}
              endIcon={<PlusIcon className="size-4" />}
              loading={buttonAdd.isLoading}
              className="whitespace-nowrap"
            >
              {buttonAdd.text}
            </Button>
          )}
        </div>

        {(topRightComponent || search?.enableSearch) && (
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
        )}
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

      {/* ── CARD VIEW (mobile < md) ── */}
      <div className="md:hidden space-y-3">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-md shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <>
            <div className="space-y-3">
              {dataSource.length === 0 && <TableEmpty />}

              {dataSource?.map((row, rowIndex) => {
                const {
                  pinKey = "pin",
                  imageKey = "image",
                  nameKey = "name",
                  statusKey = "status",
                  actionsKey = "actions",
                } = cardConfig ?? {};

                const pinCol = columns.find((c) => String(c.key) === pinKey);
                const imageCol = columns.find((c) => String(c.key) === imageKey);
                const nameCol = columns.find((c) => String(c.key) === nameKey);
                const statusCol = columns.find((c) => String(c.key) === statusKey);
                const actionCol = columns.find(
                  (c) =>
                    String(c.key) === actionsKey || c.title.trim().toLowerCase() === "thao tác",
                );
                const metaCols = columns.filter(
                  (c) =>
                    c !== pinCol &&
                    c !== imageCol &&
                    c !== nameCol &&
                    c !== statusCol &&
                    c !== actionCol &&
                    !c.hideOnMobile,
                );

                const renderCol = (col: (typeof columns)[number]) =>
                  col.render
                    ? col.render(row, rowIndex)
                    : String(row[col.key as keyof TRow] ?? "—");

                return (
                  <div
                    key={getRowKey(row, rowKey) ?? rowIndex}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3"
                  >
                    {/* ── Header: ảnh + tên + pin + status ── */}
                    <div className="flex items-start gap-3">
                      {/* Ảnh */}
                      {imageCol && (
                        <div className="shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                          {renderCol(imageCol)}
                        </div>
                      )}

                      {/* Tên + status */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {nameCol && (
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-snug">
                            {renderCol(nameCol)}
                          </p>
                        )}
                        {statusCol && <div>{renderCol(statusCol)}</div>}
                      </div>

                      {/* Pin icon */}
                      {pinCol && <div className="shrink-0">{renderCol(pinCol)}</div>}
                    </div>

                    {/* ── Meta: grid 2 cột pill ── */}
                    {metaCols.length > 0 && (
                      <div className="grid grid-cols-1 gap-2">
                        {metaCols.map((col) => (
                          <div
                            key={String(col.key)}
                            className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 ${
                              col.cardFullWidth ? "col-span-2" : ""
                            }`}
                          >
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                              {col.title}
                            </p>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {renderCol(col)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Actions ── */}
                    {actionCol && (
                      <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                        <div className="w-full [&_.ant-space]:flex! [&_.ant-space]:gap-2! [&_.ant-space]:w-full! [&_.ant-space-item]:m-0! [&_.ant-space-item:first-child]:flex-1! [&_.ant-space-item:first-child_button]:w-full!">
                          {renderCol(actionCol)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {fetching && (
              <div className="fixed inset-0 top-16 flex items-center justify-center pointer-events-none z-50">
                <Spin size="medium" />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── TABLE VIEW (desktop >= md) ── */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Spin spinning={fetching} size="medium">
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader className="bg-gray-100 dark:bg-white/5 h-14 text-[16px]">
                <TableRow>
                  {columns.map((column) => {
                    return (
                      <TableCell
                        key={String(column.key)}
                        isHeader
                        className={`px-4 py-3 font-medium text-gray-700 dark:text-gray-300 ${getAlignClass(column.align)} ${column.headerClassName ?? ""}`}
                      >
                        {column.title}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isInitialLoading && (
                  <TableRow>
                    <td colSpan={columns.length} className="px-0 py-0">
                      <TableLoadingAnimate />
                    </td>
                  </TableRow>
                )}

                {!isInitialLoading &&
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

                {!isInitialLoading && dataSource.length === 0 && (
                  <TableRow>
                    <td colSpan={columns.length} className="px-0 py-0">
                      <TableEmpty />
                    </td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Spin>
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
