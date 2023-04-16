import useTranslation from "next-translate/useTranslation";

import { AdminViewAccountOptionEnums } from "@/features/admin/enums/AdminOptionEnums";
import { format } from "date-fns";
import { Dispatch, SetStateAction } from "react";

import { useDispatch } from "react-redux";

import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { trpc } from "@/utils/trpc";
import { ChevronLeftIcon } from "@chakra-ui/icons";

export const ViewUsedClass = ({
  bookingTimeSlotIds,
  setView,
}: {
  bookingTimeSlotIds: string[];
  setView: Dispatch<SetStateAction<AdminViewAccountOptionEnums>>;
}) => {
  const { t } = useTranslation("classes");
  const dispatch = useDispatch();

  const { data, isLoading } = trpc.bookingTimeSlotRouter.fetch.useQuery({
    ids: bookingTimeSlotIds,
  });

  if (isLoading || !data) {
    return <></>;
  }
  return (
    <div>
      <ChevronLeftIcon
        fontSize="3xl"
        cursor="pointer"
        onClick={() => {
          setView(AdminViewAccountOptionEnums.VIEW_ACCOUNT);
        }}
      />
      <div>
        {bookingTimeSlotIds.length > 0 ? (
          data.map((bookingTimeSlot, index) => {
            const { startTime, endTime, className, coachName, date } =
              bookingTimeSlot;
            return (
              <div key={index}>
                <p>{className}</p>
                <p>{coachName}</p>
                <div>
                  <p>{format(new Date(date!), "yyyy-MM-dd")}</p>
                  <div>
                    {getTimeDuration({ startTime, endTime })}
                    <div>
                      {t("classes:duration")}:{" "}
                      {t(...(getDuration({ startTime, endTime }) as [string]))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-blueGray-700">
            <p>{t("classes:no_class")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
