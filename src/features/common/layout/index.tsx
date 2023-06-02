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

  return (
    <div>
      <HeadHtml />
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
  );
};

export default Layout;
