import { trpc } from "@/utils/trpc";
import { Notification } from "@prisma/client";
import { format } from "date-fns";
import { useMemo } from "react";

export const useGetNotificationRecord = () => {
  const { data } = trpc.notificationRouter.fetch.useQuery();

  const records = useMemo(() => {
    const sortedRecords: {
      date: string;
      records: Notification[];
    }[] = [];
    if (!data || data.length === 0) return sortedRecords;
    data.map((record) => {
      const date = format(record.createdAt, "yyyy-MM-dd");
      const checkIfExist = sortedRecords.findIndex(
        (slot) => slot.date === date
      );
      if (checkIfExist !== -1) {
        sortedRecords[checkIfExist].records.push(record);
        return;
      }
      sortedRecords.push({
        date,
        records: [record],
      });
    });
    return sortedRecords;
  }, [data]);

  return {
    records,
  };
};
