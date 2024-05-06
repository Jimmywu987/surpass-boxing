import Image from "next/image";

export const DesktopImageSection = () => {
  return (
    <div className="h-[90vh] md:w-3/6 relative hidden md:flex items-center">
      <div className="absolute z-20 hover:z-30 shadow-2xl top-20">
        <div className="relative md:w-[300px] lg:w-[400px] xl:w-[540px] h-[50vh] md:h-[60vh] ">
          <Image
            src="/place-1.jpg"
            alt="background-image"
            className="object-cover rounded-sm"
            fill
          />
          <div className="hover:opacity-0 absolute opacity-50 w-full h-full bg-black rounded-sm transition duration-300" />
        </div>
      </div>
      <div className="absolute z-10 hover:z-30 shadow-2xl top-40 left-20">
        <div className="relative md:w-[300px] lg:w-[400px] xl:w-[540px] h-[50vh] md:h-[60vh]">
          <Image
            src="/place-2.jpg"
            alt="background-image"
            className="object-cover rounded-sm"
            fill
          />
          <div className="hover:opacity-0 absolute opacity-50 w-full h-full bg-black rounded-sm transition duration-300" />
        </div>
      </div>
    </div>
  );
};
