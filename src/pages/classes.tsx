import { Button, useDisclosure } from "@chakra-ui/react";

import { endOfDay, format, isBefore, startOfDay, subDays } from "date-fns";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";

import { OpenModelType } from "@/features/common/enums/OpenModelType";
import { useSession } from "next-auth/react";

import { ModalComponent } from "@/features/common/components/Modal";

import { DatePicker } from "@/features/common/components/DatePicker";

import { ClassesPageModalContent } from "@/features/classes/components/ClassesPageModalContent";
import { ClassPageContent } from "@/features/classes/components/ClassPageContent";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

const ClassesPage = () => {
  const { t } = useTranslation("classes");
  const session = useSession();
  const router = useRouter();
  const { date: queryDate } = router.query;
  const now = new Date();

  const noSpecificDate =
    !queryDate ||
    isNaN(new Date(queryDate.toString()) as unknown as number) ||
    isBefore(new Date(queryDate.toString()), startOfDay(now));

  const isAuthenticated = session.status === "authenticated";

  const [modelType, setModelType] = useState(OpenModelType.OPEN_CLASS);

  const { data: lessonsData } = trpc.lessonClassRouter.fetch.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const modalDisclosure = useDisclosure();
  const { onOpen } = modalDisclosure;

  const handleOpenModel = () => {
    onOpen();
    if (!isAuthenticated) {
      setModelType(OpenModelType.LOGIN);
      return;
    }
    if (!lessonsData || lessonsData.length === 0) {
      setModelType(OpenModelType.REQUEST_LESSON_MESSAGE);
      return;
    }
    setModelType(OpenModelType.OPEN_CLASS);
  };

  const [query, setQuery] = useState({
    skip: 0,
    date: noSpecificDate ? now.toString() : queryDate.toString(),
  });

  const { data, isLoading } =
    trpc.bookingTimeSlotRouter.fetchForStudent.useQuery(query);

  const date = new Date(query.date);
  const minDate = endOfDay(subDays(new Date(), 1));

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
          <div>
            <Button onClick={handleOpenModel} isDisabled={data?.isDayOff}>
              {t("open_a_class")}
            </Button>
          </div>
        </div>
        <ClassPageContent
          data={data}
          isLoading={isLoading}
          lessonsData={lessonsData}
          handleOpenModel={handleOpenModel}
          query={query}
          setQuery={setQuery}
        />
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
