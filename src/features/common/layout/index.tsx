import { Footer } from "@/features/footer";
import { HeadHtml } from "@/features/head";

import { Navbar } from "@/features/nav/Navbar";
import { cn } from "@/utils/cn";
import { useRouter } from "next/router";
import { FC } from "react";

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { route } = router;

  const isMainPage = route === "/";

  return (
    <div className="min-h-screen">
      <HeadHtml />
      <div
        className={cn(
          isMainPage && "relative",
          "min-h-screen flex flex-col justify-between"
        )}
      >
        <div>
          <Navbar />
          <main
            className={cn(
              !["/", "/location"].includes(route) && "container mx-auto"
            )}
          >
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
