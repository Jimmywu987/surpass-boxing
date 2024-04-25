import { Button, useDisclosure } from "@chakra-ui/react";

import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  subDays,
} from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { useMemo, useState } from "react";

import { OpenModelType } from "@/features/common/enums/OpenModelType";
import { useSession } from "next-auth/react";

import { ModalComponent } from "@/features/common/components/Modal";

import { DatePicker } from "@/features/common/components/DatePicker";

import { ClassPageContent } from "@/features/classes/components/ClassPageContent";
import { ClassesPageModalContent } from "@/features/classes/components/ClassesPageModalContent";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

const ClassesPage = () => {
  const { t } = useTranslation("classes");
  const session: any = useSession();

  const isAuthenticated = session.status === "authenticated";

  const router = useRouter();
  const { date: queryDate } = router.query;
  const now = new Date();

  const noSpecificDate =
    !queryDate ||
    isNaN(new Date(queryDate.toString()) as unknown as number) ||
    isBefore(new Date(queryDate.toString()), startOfDay(now));

  const [query, setQuery] = useState({
    skip: 0,
    date: noSpecificDate ? now.toString() : queryDate.toString(),
  });

  const { data: lessonData } = trpc.lessonClassRouter.fetch.useQuery(
    { date: query.date },
    {
      enabled: isAuthenticated,
    }
  );

  const [modelType, setModelType] = useState(OpenModelType.OPEN_CLASS);
  const [onlyShowConfirmedClasses, setOnlyShowConfirmedClasses] =
    useState(false);

  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;

  const isAdmin: boolean = session.data?.user["admin"];

  const canJoin = useMemo(() => {
    if (!lessonData?.lessons) {
      return false;
    }
    return lessonData?.lessons?.some((lesson) => {
      const { startDate, expiryDate } = lesson;
      const startOfSelectedDate = startOfDay(new Date(query.date));
      const endOfSelectedDate = endOfDay(new Date(query.date));
      return (
        isAfter(expiryDate, startOfSelectedDate) &&
        isAfter(endOfSelectedDate, startDate)
      );
    });
  }, [query.date, lessonData?.lessons]);
  const bookingTimeSlotResult =
    trpc.bookingTimeSlotRouter.fetchForStudent.useQuery(query);

  const { data, isLoading } = bookingTimeSlotResult;
  const date = new Date(query.date);
  const minDate = endOfDay(subDays(new Date(), 1));

  const isDayOff = useMemo(() => {
    return data?.dayOffs.find((each) => {
      return isSameDay(each.date, date);
    });
  }, [data?.dayOffs, date]);

  const handleOpenModel = () => {
    onOpen();
    if (!isAuthenticated) {
      setModelType(OpenModelType.LOGIN);
      return;
    }
    if (
      (!lessonData?.lessons || lessonData.lessons.length === 0 || !canJoin) &&
      !isAdmin
    ) {
      setModelType(OpenModelType.REQUEST_LESSON_MESSAGE);
      return;
    }

    setModelType(OpenModelType.OPEN_CLASS);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center text-white mt-24">
        {t("please_contact_coach_to_get_class_info")}
      </div>
    );
  }
  return (
    <>
      <div className="space-y-2 p-2 md:p-0">
        <h1 className="text-white text-3xl">{t("classes")}</h1>
        <div className="flex space-x-2 items-center">
          <div className="w-36">
            <DatePicker
              datePickerProps={{
                date,
                onDateChange: (value) => {
                  setQuery(() => ({
                    skip: 0,
                    date: value.toString(),
                  }));
                },
                minDate,
              }}
            />
          </div>
          <div className="text-white">
            {t(format(date, "EEEE").toLowerCase())}
          </div>
          <Button onClick={handleOpenModel} isDisabled={!!isDayOff}>
            {t("open_a_class")}
          </Button>
          <Button
            onClick={() => setOnlyShowConfirmedClasses((prev) => !prev)}
            backgroundColor={onlyShowConfirmedClasses ? "gray.200" : "gray.700"}
            px="4"
            variant="unstyled"
          >
            {t("only_show_confirmed_classes")}
          </Button>
        </div>
        {lessonData?.lessons.length === 0 &&
        lessonData?.classes.length === 0 &&
        !isAdmin ? (
          <div className="text-center text-white mt-24">
            {t("please_contact_coach_to_get_class_info")}
          </div>
        ) : (
          <ClassPageContent
            canJoin={canJoin}
            data={data}
            isLoading={isLoading}
            lessonsData={lessonData?.lessons}
            handleOpenModel={handleOpenModel}
            onlyShowConfirmedClasses={onlyShowConfirmedClasses}
          />
        )}
      </div>
      <ModalComponent
        modalDisclosure={modalDisclosure}
        content={
          <ClassesPageModalContent
            modalDisclosure={modalDisclosure}
            setModelType={setModelType}
            modelType={modelType}
            date={date}
          />
        }
      />
    </>
  );
};

export default ClassesPage;
