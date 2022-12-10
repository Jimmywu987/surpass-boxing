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
      className={`text-xl font-semibold  text-link-normal transition hover:bg-link-bgHover hover:scale-110 hover:text-theme-color py-2 px-2.5 rounded ${className} ${
        currentPath ? "text-theme-color" : "text-white"
      }`}
    >
      {text}
    </Link>
  );
};
