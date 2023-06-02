import { FacebookSvgIcon } from "@/features/common/components/buttons/svg/FacebookSvgIcon";
import { InstagramSvgIcon } from "@/features/common/components/buttons/svg/InstagramSvgIcon";
import { WhatsappSvgIcon } from "@/features/common/components/buttons/svg/WhatsappSvgIcon";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 flex flex-col md:flex-row md:justify-between p-2 space-y-2 md:space-y-0">
      <div className="flex space-x-2">
        <WhatsappSvgIcon className="fill-white hover:fill-theme-color hover:scale-110 duration-200" />
        <FacebookSvgIcon className="fill-white hover:fill-theme-color hover:scale-110 duration-200" />
        <InstagramSvgIcon className="fill-white hover:fill-theme-color hover:scale-110 duration-200" />
      </div>
      <p className="text-white">
        © Copyright 2023 | Surpass Boxing Gyms | All rights reserved
      </p>
    </footer>
  );
};
