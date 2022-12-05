import Link from "next/link";

export const NavLink = ({
  text,
  url,
  className,
}: {
  text: string;
  url: string;
  className?: string;
}) => {
  return (
    <Link
      href={url}
      passHref
      className={`text-xl font-semibold text-white text-link-normal transition hover:bg-link-bgHover hover:scale-110 hover:text-theme-color py-2 px-2.5 rounded ${className}`}
    >
      {text}
    </Link>
  );
};
