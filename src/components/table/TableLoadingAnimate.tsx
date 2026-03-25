import { Spin } from "antd";

export default function TableLoadingAnimate() {
  return (
    <div className="flex items-center justify-center min-h-56">
      <Spin />
    </div>
  );
}
