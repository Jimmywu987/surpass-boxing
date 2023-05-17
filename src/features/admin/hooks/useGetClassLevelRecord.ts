import { AdminJoinLevelEnums } from "@/features/admin/enums/AdminOptionEnums";
import { trpc } from "@/utils/trpc";
import { ClassLevelDifferentRecord, ClassLevelEnum } from "@prisma/client";
import { format } from "date-fns";
import { useMemo, useState } from "react";

export const useGetClassLevelRecord = () => {
  const [joinLevelFilter, setJoinLevelFilter] = useState(
    AdminJoinLevelEnums.ALL
  );
  const { data } = trpc.classRouter.levelRecordRouter.fetch.useQuery();
  const levelRecords = useMemo(() => {
    const sortedRecords: {
      date: string;
      records: (ClassLevelDifferentRecord & {
        user: {
          username: string;
        };
      })[];
    }[] = [];
    if (!data || data.length === 0) return sortedRecords;
    data
      .filter((filter) => {
        const { levelFrom, levelTo } = filter;
        return (
          joinLevelFilter === AdminJoinLevelEnums.ALL ||
          // join lower level
          (joinLevelFilter === AdminJoinLevelEnums.JOIN_LOWER_LEVEL &&
            (levelFrom === ClassLevelEnum.ADVANCED ||
              (levelFrom === ClassLevelEnum.INTERMEDIATE &&
                levelTo === ClassLevelEnum.BEGINNER))) ||
          // join higher level
          (joinLevelFilter === AdminJoinLevelEnums.JOIN_HIGHER_LEVEL &&
            (levelFrom === ClassLevelEnum.BEGINNER ||
              (levelFrom === ClassLevelEnum.INTERMEDIATE &&
                levelTo === ClassLevelEnum.ADVANCED)))
        );
      })
      .map((record) => {
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
  }, [data, joinLevelFilter]);

  return {
    levelRecords,
    joinLevelFilter,
    setJoinLevelFilter,
  };
};
