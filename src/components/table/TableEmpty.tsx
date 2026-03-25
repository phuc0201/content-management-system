import TableEmptyImage from "../../assets/images/table/table-empty.png";

export default function TableEmpty() {
  return (
    <div className="flex items-center justify-center h-56 w-full">
      <img src={TableEmptyImage} alt="No Data" className="w-20 h-20 object-cover" />
    </div>
  );
}
