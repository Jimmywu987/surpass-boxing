import { Navbar } from "@/features/nav/Navbar";
import { Footer } from "@/features/footer";
import { HeadHtml } from "@/features/head";

const Layout = ({ children, initData }: any) => {
  return (
    <div className="bg-gray-800 ">
      <HeadHtml />
      <Navbar />
      <main className="min-h-[80vh] container mx-auto">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
