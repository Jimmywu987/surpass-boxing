import { cn } from "@/utils/cn";
import Link from "next/link";
import { useRouter } from "next/router";

export const MobileNavLink = ({
  text,
  url,
  className,
  onClose,
}: {
  text: string;
  url: string;
  className?: string;
  onClose: () => void;
}) => {
  const router = useRouter();

  const currentPath = router.pathname === url;

  return (
    <Link
      href={url}
      passHref
      className={cn(
        "text-xl font-semibold  text-link-normal py-2 px-2.5 rounded ",
        currentPath ? "text-theme-color" : "text-gray-700",
        className
      )}
      onClick={onClose}
    >
      {text}
    </Link>
  );
};
