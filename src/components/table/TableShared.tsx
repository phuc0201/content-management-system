import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table/index";
import type { RowKeyType, TableAlign, TableProps } from "../../types/table.type";
import Button from "../ui/button/Button";
import { PlusIcon } from "../../assets/icons";
import TableEmpty from "./TableEmpty";
import { Pagination } from "antd";
import TableLoadingAnimate from "./TableLoadingAnimate";
import Input from "../form/input/InputField";
import { CiSearch } from "react-icons/ci";

const getAlignClass = (align?: TableAlign) => {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
};

function getRowKey<T>(record: T, rowKey: RowKeyType<T>): string | number {
  if (typeof rowKey === "function") {
    return rowKey(record);
  }
  return record[rowKey] as string | number;
}

function TableShared<TRow>({
  dataSource = [],
  columns = [],
  rowKey = "id" as RowKeyType<TRow>,
  search,
  buttonAdd = {
    show: true,
    text: "Thêm mới",
    onAdd: () => {},
  },
  pagination,
  loading = false,
  className = "",
}: TableProps<TRow>) {
  return (
    <div
      className={`space-y-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3 sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          {buttonAdd.show && (
            <Button size="md" onClick={buttonAdd.onAdd} endIcon={<PlusIcon className="size-4" />}>
              {buttonAdd.text}
            </Button>
          )}
        </div>

        {search?.enableSearch && (
          <div className="relative">
            <CiSearch
              className="absolute z-30 -translate-y-1/2 cursor-pointer left-4 top-1/2 text-gray-600 dark:text-gray-400"
              size={20}
            />
            <Input
              type="text"
              id="tabelSearchbox"
              placeholder={search.placeholder}
              className="xl:w-80! w-full! px-10"
            />
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <Table className="text-sm">
            <TableHeader className="bg-gray-100 dark:bg-white/5 h-14 text-[16px]">
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={String(column.key)}
                    isHeader
                    className={`px-4 py-3 font-medium text-gray-700 dark:text-gray-300 ${getAlignClass(
                      column.align,
                    )} ${column.headerClassName ?? ""}`}
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
                        className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${getAlignClass(
                          column.align,
                        )} ${column.cellClassName ?? ""}`}
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
