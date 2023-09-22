import useTranslation from "next-translate/useTranslation";

import { format } from "date-fns";

import { getDuration } from "@/helpers/getDuration";
import { getTimeDuration } from "@/helpers/getTime";
import { trpc } from "@/utils/trpc";
import { ChevronLeftIcon } from "@chakra-ui/icons";

export const ViewUsedClass = ({
  bookingTimeSlotIds,
  onClick,
}: {
  bookingTimeSlotIds: string[];
  onClick: () => void;
}) => {
  const { t } = useTranslation("classes");

  const { data, isLoading } = trpc.bookingTimeSlotRouter.fetch.useQuery({
    ids: bookingTimeSlotIds,
  });

  if (isLoading || !data) {
    return <></>;
  }
  return (
    <div>
      <ChevronLeftIcon fontSize="3xl" cursor="pointer" onClick={onClick} />
      <div className="space-y-2">
        {bookingTimeSlotIds.length > 0 ? (
          data.map((bookingTimeSlot, index) => {
            const { startTime, endTime, className, coach, date } =
              bookingTimeSlot;
            return (
              <div key={index} className="border-2 border-gray-200 rounded p-3">
                <p>{className}</p>
                {coach && <p>{coach.username}</p>}
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
