import { BookClassButton } from "@/features/common/components/buttons/BookClassButton";
import Image from "next/image";

export const MobileImageSection = () => {
  return (
    <div className="md:hidden w-screen px-2 space-y-2">
      <div className="relative w-full h-[330px]">
        <Image
          src="/main-page.jpeg"
          alt="background-image"
          className="object-cover rounded-sm"
          fill
        />
      </div>
      <div className="relative w-full h-[330px]">
        <Image
          src="/place-1.jpg"
          alt="background-image"
          className="object-cover rounded-sm"
          fill
        />
      </div>
      <div className="relative w-full h-[330px]">
        <Image
          src="/place-2.jpg"
          alt="background-image"
          className="object-cover rounded-sm"
          fill
        />
      </div>
      <BookClassButton className="block md:hidden py-6 text-white" />
    </div>
  );
};
