import { BookClassButton } from "@/features/common/components/buttons/BookClassButton";
import Image from "next/image";

export const MobileImageSection = () => {
  return (
    <div className="md:hidden w-screen px-2 space-y-2">
      <div className="relative w-full h-[330px]">
        <Image
          src="https://res.cloudinary.com/dvoucdrom/image/upload/v1685990027/20230604_182418-min_x9kdzi.jpg"
          alt="background-image"
          className="object-cover rounded-sm"
          fill
        />
      </div>
      <div className="relative w-full h-[330px]">
        <Image
          src="https://res.cloudinary.com/dvoucdrom/image/upload/v1685990029/20230604_182638-min_gjjn0k.jpg"
          alt="background-image"
          className="object-cover rounded-sm"
          fill
        />
      </div>
      <BookClassButton className="block md:hidden py-6 text-white" />
    </div>
  );
};
