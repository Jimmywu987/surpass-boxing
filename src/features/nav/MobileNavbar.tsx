import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import { MobileNavLink } from "@/features/nav/components/MobileNavLink";
import useTranslation from "next-translate/useTranslation";
import { LanguageSvgIcon } from "@/features/common/components/buttons/svg/LanguageSvgIcon";

import { useSession } from "next-auth/react";
import { User } from "@prisma/client";

export const MobileNavbar = ({
  onClickLanguageHandler,
  onClose,
}: {
  onClickLanguageHandler: (language: "zh-HK" | "en") => Promise<void>;
  onClose: () => void;
}) => {
  const { t, lang } = useTranslation("common");

  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user as User;
  const langIsHk = lang === "zh-HK";
  return (
    <div className="w-full flex flex-col space-y-3">
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton display="flex">
            <LanguageSvgIcon h="22" w="22" className="fill-gray-600 " />
            <Box as="span" flex="1" textAlign="left">
              {t("current_language")}
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <AccordionButton
              fontWeight={langIsHk ? "bold" : "normal"}
              bgColor={langIsHk ? "#c8d3e1" : "white"}
              color="#1F2937"
              onClick={() => onClickLanguageHandler("zh-HK")}
            >
              中文(繁體)
            </AccordionButton>
            <AccordionButton
              fontWeight={!langIsHk ? "bold" : "normal"}
              bgColor={!langIsHk ? "#c8d3e1" : "white"}
              color="#1F2937"
              onClick={() => onClickLanguageHandler("en")}
            >
              English
            </AccordionButton>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <div className="flex flex-col">
        <MobileNavLink text={t("home")} url="/" onClose={onClose} />
        <MobileNavLink text={t("classes")} url="/classes" onClose={onClose} />
        <MobileNavLink text={t("coaches")} url="/coaches" onClose={onClose} />
        <MobileNavLink
          text={t("bulletin_board")}
          url="/bulletin-board"
          onClose={onClose}
        />
        <MobileNavLink text={t("location")} url="/location" onClose={onClose} />
        {isAuthenticated && user.admin && (
          <MobileNavLink text={t("admin")} url="/admin" onClose={onClose} />
        )}
      </div>
    </div>
  );
};
