import { useOneSignal } from "@/features/common/hooks/useOneSignal";
import { Footer } from "@/features/footer";
import { HeadHtml } from "@/features/head";
import { MainPageVideo } from "@/features/home/components/MainPageVideo";
import { Navbar } from "@/features/nav/Navbar";
import { cn } from "@/utils/cn";
import { useRouter } from "next/router";
import { FC } from "react";

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
  useOneSignal();
  const router = useRouter();
  const { route } = router;

  const isMainPage = route === "/";

  return (
    <div>
      <HeadHtml />
      <div className={cn(isMainPage && "relative")}>
        <MainPageVideo />
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
