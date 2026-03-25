import GridImage from "../../../assets/images/grid-image/image-01.png";

export default function ResponsiveImage({ imageSrc = "" }: { imageSrc?: string }) {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <img
          src={imageSrc === "" ? GridImage : imageSrc}
          alt="Cover"
          className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
        />
      </div>
    </div>
  );
}
