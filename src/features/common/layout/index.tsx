import { Navbar } from "@/features/nav/Navbar";
import { Footer } from "@/features/footer";
import { HeadHtml } from "@/features/head";
import { useOneSignal } from "@/features/common/hooks/useOneSignal";
import { FC } from "react";
import { useRouter } from "next/router";
import { cn } from "@/utils/cn";
import { isMobile } from "react-device-detect";
import { useCheckMainPageAtTop } from "@/features/common/hooks/useCheckMainPageAtTop";

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
  useOneSignal();
  const router = useRouter();
  const { route } = router;
  const { isTop } = useCheckMainPageAtTop();

  const isMainPage = route === "/";
  return (
    <div>
      <HeadHtml />
      <div className={cn(isMainPage && "relative")}>
        {isMainPage && !isMobile && (
          <div className="">
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
          </div>
        )}
        <Navbar />
        <main
          className={cn(
            "min-h-[78vh]",
            !["/", "/location"].includes(route) && "container mx-auto"
          )}
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
