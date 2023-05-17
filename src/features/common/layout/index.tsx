import { Navbar } from "@/features/nav/Navbar";
import { Footer } from "@/features/footer";
import { HeadHtml } from "@/features/head";

const Layout = ({ children }: any) => {
  return (
    <div className="bg-gray-800 ">
      <HeadHtml />
      <Navbar />
      <main className="min-h-[78vh] container mx-auto my-4">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
