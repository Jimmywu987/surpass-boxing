import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { cn } from "@/utils/cn";

export const BookClassButton = ({ className }: { className?: string }) => {
  return (
    <Link
      href="/classes"
      passHref
      className={cn(
        "self-center  hover:text-theme-color font-semibold  flex space-x-2 items-center group",
        className
      )}
    >
      <ArrowLeftIcon className="group-hover:-translate-x-4 transition duration-300" />
      <button className="duration-300 transition text-3xl">Book Class</button>
      <ArrowRightIcon className="group-hover:translate-x-4 transition duration-300" />
    </Link>
  );
};
