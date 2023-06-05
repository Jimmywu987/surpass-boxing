import useTranslation from "next-translate/useTranslation";
import { signOut, useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { isMobile } from "react-device-detect";
import Image from "next/image";

export default function HomePage() {
  const { t } = useTranslation("common");

  return (
    <div className="mx-4 ">
      {!isMobile && <div className="h-[90vh]" />}
      <div className="flex flex-col md:flex-row md:space-x-5 space-y-5 md:space-y-0 h-[90vh]">
        <div className="relative w-full h-[60vh] z-10">
          <Image
            src="https://res.cloudinary.com/dvoucdrom/image/upload/v1685990027/20230604_182418-min_x9kdzi.jpg"
            alt="background-image"
            className="object-cover rounded-lg"
            fill
          />
          <div className="opacity-0 absolute hover:opacity-70 w-full h-full bg-black z-10 rounded-xl transition duration-300" />
        </div>
        <div className="relative w-full z-10 h-[60vh]">
          <Image
            src="https://res.cloudinary.com/dvoucdrom/image/upload/v1685990029/20230604_182638-min_gjjn0k.jpg"
            alt="background-image"
            className="object-cover rounded-lg"
            fill
          />
          <div className="opacity-0 absolute hover:opacity-70 w-full h-full bg-black z-10 rounded-xl transition duration-300" />
        </div>
      </div>
    </div>
  );
}
