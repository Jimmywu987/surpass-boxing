import { Navbar } from "@/features/nav/Navbar";
import { Footer } from "@/features/footer";
import { HeadHtml } from "@/features/head";
import { useOneSignal } from "@/features/common/hooks/useOneSignal";
import { FC } from "react";
import { useRouter } from "next/router";
import { cn } from "@/utils/cn";

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
  useOneSignal();
  const router = useRouter();
  const { route } = router;
  const isMainPage = route === "/";
  return (
    <div>
      <HeadHtml />
      <div className={cn(isMainPage && "relative h-screen overflow-hidden")}>
        {isMainPage && (
          <video
            autoPlay
            loop
            muted
            className="absolute -z-10 w-auto 
            min-w-full min-h-full max-w-none opacity-50"
          >
            <source
              // src="https://surpass-boxing-gym.s3.ap-southeast-1.amazonaws.com/videos/background_compressed.mp4"
              src="https://surpass-boxing-gym.s3.ap-southeast-1.amazonaws.com/videos/background.mp4"
              type="video/mp4"
            />
          </video>
        )}
        <Navbar />
        <main
          className={cn(
            "min-h-[78vh] ",
            route !== "/location" && "container mx-auto"
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
