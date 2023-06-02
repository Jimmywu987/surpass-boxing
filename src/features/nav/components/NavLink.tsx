import { cn } from "@/utils/cn";
import Link from "next/link";
import { useRouter } from "next/router";

export const NavLink = ({
  text,
  url,
  className,
}: {
  text: string;
  url: string;
  className?: string;
}) => {
  const router = useRouter();

  const currentPath = router.pathname === url;

  return (
    <Link
      href={url}
      passHref
      className={cn(
        "nav-link text-link-normal",
        currentPath ? "text-theme-color" : "text-gray-400 hover:text-white",
        className
      )}
    >
      {text}
    </Link>
  );
};
