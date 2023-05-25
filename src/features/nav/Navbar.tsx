import DefaultProfileImg from "@/../public/default-profile-img.png";
import LogoIcon from "@/../public/logo.png";
import { FacebookSvgIcon } from "@/features/common/components/buttons/svg/FacebookSvgIcon";
import { InstagramSvgIcon } from "@/features/common/components/buttons/svg/InstagramSvgIcon";
import { LanguageSvgIcon } from "@/features/common/components/buttons/svg/LanguageSvgIcon";
import { WhatsappSvgIcon } from "@/features/common/components/buttons/svg/WhatsappSvgIcon";
import { useOneSignal } from "@/features/common/hooks/useOneSignal";
import { NavLink } from "@/features/nav/components/NavLink";
import { MobileNavbar } from "@/features/nav/MobileNavbar";
import { trpc } from "@/utils/trpc";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
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
import { useEffect, useRef } from "react";
import { MobileNavLink } from "./components/MobileNavLink";

export const Navbar = () => {
  const { t, lang } = useTranslation("common");

  const router = useRouter();
  const { pathname, asPath, query } = router;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user as User;
  const { storeUserExternalId } = useOneSignal();
  const { mutateAsync } = trpc.userRouter.updateLang.useMutation();
  useEffect(() => {
    const storeUserIdToOneSignal = async () => {
      if (isAuthenticated) {
        await storeUserExternalId(user.id);
      }
    };

    storeUserIdToOneSignal();
  }, [isAuthenticated]);

  const onClickLanguageHandler = async (language: "zh-HK" | "en") => {
    router.push({ pathname, query }, asPath, { locale: language });
    await mutateAsync({
      lang: language === "en" ? LanguageEnum.EN : LanguageEnum.ZH,
    });
  };
  const langIsHk = lang === "zh-HK";
  return (
    <nav className=" flex py-3 px-5 justify-between items-center shadow-lg ">
      <div className="flex items-center flex-1 px-1 space-x-2 justify-between ">
        <div className="flex h-28 space-x-6 items-center">
          <Link
            href="/"
            passHref
            className="relative w-24 h-24 border-2 border-white rounded-full duration-200"
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
            <div className="flex flex-col justify-between">
              <div className="my-1 mx-4 flex justify-end items-center">
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
                    bgColor="#1F2937"
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
                <NavLink text={t("location")} url="/location" />
              </div>
            </div>
            <div className="flex flex-col justify-between">
              <div className="flex space-x-3 ">
                {/* @todo: implement the links */}
                <WhatsappSvgIcon className="fill-white hover:fill-green-600 hover:scale-110 duration-200" />
                <FacebookSvgIcon className="fill-white hover:fill-blue-600 hover:scale-110 duration-200" />
                <InstagramSvgIcon className="fill-white hover:fill-pink-600 hover:scale-110 duration-200" />
              </div>

              <div className="flex self-end ">
                {isAuthenticated ? (
                  <Link
                    href={`/profile/${user.id}`}
                    passHref
                    className="flex items-center space-x-2 transition hover:bg-link-bgHover hover:scale-110 text-white hover:text-theme-color rounded p-1 text-lg text-link-normal "
                  >
                    <div className="w-10 h-10 relative">
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
          <Button ref={btnRef} onClick={onOpen} w="9" h="9">
            <HamburgerIcon h="8" w="8" className="bg-white rounded p-1" />
          </Button>
          <Drawer
            isOpen={isOpen}
            placement="right"
            onClose={onClose}
            finalFocusRef={btnRef}
          >
            <DrawerOverlay />

            <DrawerContent>
              <DrawerCloseButton fontSize="xl" my="8" mr="6" w="10" h="10" />
              <div className="flex space-x-2 px-6 py-2">
                <WhatsappSvgIcon className="fill-gray-800 hover:fill-green-600 hover:scale-110 duration-200" />
                <FacebookSvgIcon className="fill-gray-800 hover:fill-blue-600 hover:scale-110 duration-200" />
                <InstagramSvgIcon className="fill-gray-800 hover:fill-pink-600 hover:scale-110 duration-200" />
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
