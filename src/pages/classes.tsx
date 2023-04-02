import { Button, Skeleton, Stack, useDisclosure } from "@chakra-ui/react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { subDays, endOfDay, format } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { useRef, useState } from "react";
import { SignUpForm } from "@/features/signUp/components/SignUpForm";
import { LoginForm } from "@/features/login/components/LoginForm";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from "@chakra-ui/react";
import { OpenModelType } from "@/features/common/enums/OpenModelType";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";

import { ModalComponent } from "@/features/common/components/Modal";
import { CreateBookingTimeSlotForm } from "@/features/classes/components/CreateBookingTimeSlotForm";
import { useBookingTimeSlotForStudentQuery } from "@/apis/api";
const ClassesPage = () => {
  const { t, lang } = useTranslation("classes");
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const user = session.data?.user as User;
  const [modelType, setModelType] = useState(OpenModelType.OPEN_CLASS);
  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;
  const handleOpenModel = () => {
    if (!isAuthenticated) {
      setModelType(OpenModelType.SIGN_UP);
    }
    onOpen();
  };
  const [query, setQuery] = useState({
    skip: 0,
    date: new Date(),
  });
  const minDate = endOfDay(subDays(new Date(), 1));
  const { data, isLoading } = useBookingTimeSlotForStudentQuery(query);
  if (!data || isLoading) {
    return (
      <Stack>
        <Skeleton height="30px" />
      </Stack>
    );
  }
  return (
    <>
      <div>
        <h1 className="text-white text-3xl">{t("classes")}</h1>
        <div className="flex space-x-2 items-center">
          <div className="w-36">
            <SingleDatepicker
              name="date-input"
              date={query.date}
              onDateChange={(value) => {
                setQuery(() => ({ skip: 0, date: value }));
              }}
              minDate={minDate}
              propsConfigs={{
                dayOfMonthBtnProps: {
                  defaultBtnProps: {
                    borderColor: "gray.800",
                    _hover: {
                      background: "blue.400",
                    },
                  },
                  selectedBtnProps: {
                    background: "#EE72B6",
                  },
                  todayBtnProps: {
                    background: "teal.600",
                  },
                },
                inputProps: {
                  color: "white",
                  size: "sm",
                  cursor: "pointer",
                },
                popoverCompProps: {
                  popoverContentProps: {
                    background: "gray.700",
                    color: "white",
                  },
                },
              }}
            />
          </div>
          <div className="text-white">
            {t(format(query.date, "EEEE").toLowerCase())}
          </div>
          <div>
            <Button onClick={handleOpenModel}>{t("open_a_class")}</Button>
          </div>
        </div>
        <div>{/* @todo: render all classes of the day here */}</div>
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          isAuthenticated ? (
            <CreateBookingTimeSlotForm />
          ) : (
            <>
              {modelType === OpenModelType.SIGN_UP && (
                <SignUpForm
                  LoginButton={
                    <button
                      className="text-blue-700 underline hover:text-blue-800"
                      onClick={() => {
                        setModelType(OpenModelType.LOGIN);
                      }}
                    >
                      {t("auth:login.login")}
                    </button>
                  }
                />
              )}
              {modelType === OpenModelType.LOGIN && (
                <LoginForm
                  SignUpButton={
                    <button
                      className="text-blue-700 underline hover:text-blue-800"
                      onClick={() => {
                        setModelType(OpenModelType.SIGN_UP);
                      }}
                    >
                      {t("auth:sign_up.sign_up")}
                    </button>
                  }
                />
              )}
            </>
          )
        }
      />
    </>
  );
};

export default ClassesPage;
