import { useCheckMainPageAtTop } from "@/features/common/hooks/useCheckMainPageAtTop";
import { cn } from "@/utils/cn";
import { useRouter } from "next/router";
import { isMobile } from "react-device-detect";

export const MainPageVideo = () => {
  const router = useRouter();
  const { route } = router;
  const isMainPage = route === "/";

  const { isTop } = useCheckMainPageAtTop();
  if (!isMainPage || isMobile) {
    return <></>;
  }
  return (
    <>
      <video
        autoPlay
        muted
        loop
        className="absolute z-10 top-0 left-0 w-full h-screen object-cover opacity-80"
      >
        <source
          src="https://res.cloudinary.com/dvoucdrom/video/upload/v1685989481/background-compressed_g6wuv2.mp4"
          type="video/mp4"
        />
      </video>
      <div
        className={cn(
          "absolute z-10 top-0 left-0 w-full h-screen transition duration-500",
          !isTop && "bg-gray-500 opacity-30"
        )}
      />
    </>
  );
};
