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
      className={`text-xl font-semibold  text-link-normal py-2 px-2.5 rounded ${className} ${
        currentPath ? "text-theme-color" : "text-gray-700"
      }`}
      onClick={onClose}
    >
      {text}
    </Link>
  );
};
