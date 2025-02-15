import DefaultProfileImg from "@/../public/default-profile-img.png";
import LogoIcon from "@/../public/logo.png";
import { FacebookSvgIcon } from "@/features/common/components/buttons/svg/FacebookSvgIcon";
import { InstagramSvgIcon } from "@/features/common/components/buttons/svg/InstagramSvgIcon";
import { LanguageSvgIcon } from "@/features/common/components/buttons/svg/LanguageSvgIcon";
import { WhatsappSvgIcon } from "@/features/common/components/buttons/svg/WhatsappSvgIcon";
import { NavLink } from "@/features/nav/components/NavLink";
import { MobileNavbar } from "@/features/nav/MobileNavbar";
import { trpc } from "@/utils/trpc";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { LanguageEnum, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import { MobileNavLink } from "@/features/nav/components/MobileNavLink";
import { cn } from "@/utils/cn";
import { useCheckMainPageAtTop } from "@/features/common/hooks/useCheckMainPageAtTop";
import { isMobile } from "react-device-detect";

export const Navbar = () => {
  const { t, lang } = useTranslation("common");

  const router = useRouter();
  const { pathname, asPath, query } = router;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isTop, isMainPage } = useCheckMainPageAtTop();
  const btnRef = useRef(null);
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user as User;

  const { mutateAsync } = trpc.userRouter.updateLang.useMutation();

  const onClickLanguageHandler = async (language: "zh-HK" | "en") => {
    router.push({ pathname, query }, asPath, { locale: language });
    await mutateAsync({
      lang: language === "en" ? LanguageEnum.EN : LanguageEnum.ZH,
    });
  };

  const langIsHk = lang === "zh-HK";
  return (
    <nav
      className={cn(
        "flex py-3 px-5 justify-between items-center shadow-xl sticky top-0 transition duration-500 z-50",
        (!isTop || !!isMobile || !isMainPage) && "bg-gray-900 "
      )}
    >
      <div className="flex items-center flex-1 px-1 space-x-2 justify-between ">
        <div className="flex h-28 space-x-6 items-center">
          <Link
            href="/"
            passHref
            className="relative w-24 h-24 border-2 border-white rounded-full duration-200 shadow-theme"
          >
            <Image
              src={LogoIcon}
              fill
              className="w-full h-full object-contain rounded-full"
              alt="logo-image"
            />
          </Link>
        </div>
        <div className="hidden md:flex flex-col justify-start">
          <div className="flex h-28">
            <div className="flex flex-col justify-between items-center ">
              <div className="my-1 mx-4 flex self-end items-center space-x-2 h-full">
                {isAuthenticated && user.admin && (
                  <NavLink text={t("admin")} url="/admin" />
                )}

                <Menu>
                  <MenuButton
                    leftIcon={
                      <LanguageSvgIcon
                        h="22"
                        w="22"
                        className="group-hover:fill-theme-color fill-white group-expended:fill-theme-color"
                      />
                    }
                    as={Button}
                    color="white"
                    className="group"
                    bgColor="transparent"
                    _hover={{}}
                    _expanded={{ color: "#EE72B6", bgColor: "#1F2937" }}
                    _active={{}}
                  >
                    {t("current_language")}
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      fontWeight={langIsHk ? "bold" : "normal"}
                      bgColor={langIsHk ? "#c8d3e1" : "white"}
                      color="#1F2937"
                      onClick={() => onClickLanguageHandler("zh-HK")}
                    >
                      中文(繁體)
                    </MenuItem>
                    <MenuItem
                      fontWeight={!langIsHk ? "bold" : "normal"}
                      bgColor={!langIsHk ? "#c8d3e1" : "white"}
                      color="#1F2937"
                      onClick={() => onClickLanguageHandler("en")}
                    >
                      English
                    </MenuItem>
                  </MenuList>
                </Menu>
              </div>
              <div className="flex items-end">
                <NavLink text={t("home")} url="/" />
                <NavLink text={t("classes")} url="/classes" />
                <NavLink text={t("coaches")} url="/coaches" />
                <NavLink text={t("bulletin_board")} url="/bulletin-board" />
                <NavLink text={t("location")} url="/location" />
              </div>
            </div>
            <div className="flex flex-col justify-between ">
              <div className="flex space-x-3 h-full items-center justify-end">
                <WhatsappSvgIcon className="fill-white hover:fill-theme-color  hover:scale-110 duration-200" />
                <FacebookSvgIcon className="fill-white hover:fill-theme-color  hover:scale-110 duration-200" />
                <InstagramSvgIcon className="fill-white hover:fill-theme-color  hover:scale-110 duration-200" />
              </div>

              <div className="flex self-end ">
                {isAuthenticated ? (
                  <Link
                    href={`/profile/${user.id}`}
                    passHref
                    className="flex items-center space-x-2 text-white hover:text-theme-color rounded p-1 text-lg text-link-normal nav-link "
                  >
                    <div className="w-8 h-8 relative">
                      <Image
                        src={
                          !!user.profileImg
                            ? user.profileImg
                            : DefaultProfileImg
                        }
                        alt={`${user.username} profile image`}
                        className="w-full h-full rounded-full object-cover"
                        fill
                      />
                    </div>
                    <span className="truncate w-[4.5rem]">{user.username}</span>
                  </Link>
                ) : (
                  <NavLink text={t("login")} url="/login" />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="md:hidden">
          <button
            className={cn("hamburger shadow-theme", isOpen && "active")}
            ref={btnRef}
            onClick={onOpen}
          >
            <div>
              <span className="w-3/6 top-0 left-0 translate-y-0"></span>
              <span className="w-full scale-x-1 opacity-1"></span>
              <span className="w-3/6 bottom-0 right-0 rotate-0"></span>
            </div>
          </button>
          <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay mt="136px" />
            <DrawerContent mt="136px">
              <div className="flex space-x-2 px-6 py-2 justify-end">
                <WhatsappSvgIcon className="fill-gray-800 hover:fill-theme-color  duration-200" />
                <FacebookSvgIcon className="fill-gray-800 hover:fill-theme-color  duration-200" />
                <InstagramSvgIcon className="fill-gray-800 hover:fill-theme-color  duration-200" />
              </div>
              {isAuthenticated ? (
                <DrawerHeader>
                  <Link
                    href={`/profile/${user.id}`}
                    passHref
                    className="flex items-center rounded text-link-normal space-x-2 p-1 my-3"
                    onClick={onClose}
                  >
                    <div className="w-14 h-14 relative">
                      <Image
                        src={
                          !!user.profileImg
                            ? user.profileImg
                            : DefaultProfileImg
                        }
                        alt={`${user.username} profile image`}
                        className="w-full h-full rounded-full object-cover"
                        fill
                      />
                    </div>
                    <span className="truncate w-[4.5rem]">{user.username}</span>
                  </Link>
                </DrawerHeader>
              ) : (
                <DrawerHeader>
                  <div>Surpass Boxing</div>
                  <MobileNavLink
                    text={t("login")}
                    url="/login"
                    onClose={onClose}
                  />
                </DrawerHeader>
              )}
              <DrawerBody>
                <MobileNavbar
                  onClickLanguageHandler={onClickLanguageHandler}
                  onClose={onClose}
                />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
};
