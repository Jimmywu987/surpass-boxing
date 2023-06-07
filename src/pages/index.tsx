import { BookClassButton } from "@/features/common/components/buttons/BookClassButton";
import { DesktopImageSection } from "@/features/home/components/DesktopImageSection";
import { MobileImageSection } from "@/features/home/components/MobileImageSection";
import { isMobile } from "react-device-detect";

export default function HomePage() {
  return (
    <section>
      {!isMobile && <div className="h-[83vh]" />}
      <div className="w-full from-black to-gray-900 bg-gradient-to-r">
        <div className="container mx-auto flex flex-col md:flex-row w-full justify-around items-center py-6 text-center md:text-left">
          <div className="w-full md:w-3/6 flex flex-col py-6 text-white space-y-10">
            <div className="flex flex-col space-y-6">
              <p className="text-4xl lg:text-5xl font-bold">Explore the Gym</p>
              <p className=" text-xl md:w-5/6">
                Surpass boxing offers comprehensive all levels of boxing classes
                as well as personal training, focus on technique and fitness.
              </p>
              <p className="text-2xl md:text-4xl text-center">Train with us!</p>
            </div>
            <BookClassButton className="hidden md:block text-white" />
          </div>
          <DesktopImageSection />
          <MobileImageSection />
        </div>
      </div>
    </section>
  );
}
