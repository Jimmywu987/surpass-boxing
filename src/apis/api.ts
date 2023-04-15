import { UserType } from "@/types";
import { SortedBookingTimeSlotsType } from "@/types/timeSlots";
import {
  BookingTimeSlots,
  BookingTimeSlotStatusEnum,
  ClassesType,
  Lessons,
  News,
  RegularBookingTimeSlots,
} from "@prisma/client";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "react-query";
import { req } from "./https";

const fetcher = async (url: string, params?: any) => {
  const res = await req("post", url, params);
  if (res && res.data && res.status === 201) {
    return res.data;
  }
  throw Error(res?.data.errorMessage);
};
type UseMutationReactQueryOption = Omit<
  UseMutationOptions<any, unknown, any, unknown>,
  "mutationFn" | "mutationKey"
>;

type UseReactQueryOption = Omit<
  UseQueryOptions<any, unknown, any>,
  "queryKey" | "queryFn"
>;

export const useCreateRegularClassMutation = () =>
  useMutation(["createRegularClass"], async (params: any) => {
    return await fetcher("/api/class/regular/create", params);
  });

export const useRequestedClassQuery = (
  variable?: unknown,
  options?: UseQueryOptions<{
    totalClassesCount: number;
    totalConfirmedClasses: number;
    totalCanceledClasses: number;
    bookingTimeSlots: SortedBookingTimeSlotsType;
  }>
) =>
  useQuery<{
    totalClassesCount: number;
    totalConfirmedClasses: number;
    totalCanceledClasses: number;
    bookingTimeSlots: SortedBookingTimeSlotsType;
  }>(
    ["requestedClass", variable],
    async () => {
      return await fetcher("/api/class/requested/fetch", variable);
    },
    options
  );

export const useUpdateClassStatus = () =>
  useMutation<
    {
      status: BookingTimeSlotStatusEnum;
    },
    unknown,
    { status: BookingTimeSlotStatusEnum; id: string }
  >(["updateClassStatus"], async (params: unknown) => {
    return await fetcher("/api/class/requested/status-update", params);
  });

export const useRegularClassQuery = () =>
  useQuery<{
    regularBookingTimeSlots: (RegularBookingTimeSlots & {
      coach: {
        username: string;
      };
    })[];
  }>(["regularClass"], async () => {
    return await fetcher("/api/class/regular/fetch");
  });

export const useRemoveRegularClassMutation = () =>
  useMutation(["removeRegularClass"], async (params: any) => {
    return await fetcher("/api/class/regular/remove", params);
  });

export const useNewsQuery = () =>
  useQuery<{ news: News[] }>(["news"], async () => {
    return await fetcher("/api/news/fetch");
  });

export const useUsersQuery = (admin = false, variable?: unknown) =>
  useQuery<{
    users: UserType[];
    totalUsersCount: number;
  }>(["users", variable], async () => {
    return await fetcher(
      `/api/users/fetch${admin ? "?admin=true" : ""}`,
      variable
    );
  });

export const useAddLessonMutation = () =>
  useMutation(["addLesson"], async (params: any) => {
    return await fetcher("/api/lesson/add", params);
  });

export const useRemoveLessonMutation = (
  options?: UseMutationReactQueryOption
) =>
  useMutation(
    ["removeLesson"],
    async (params: any) => {
      return await fetcher("/api/lesson/remove", params);
    },
    options
  );

export const useJoinClassMutation = (options?: UseMutationReactQueryOption) =>
  useMutation(
    ["joinClass"],
    async (params: any) => {
      return await fetcher("/api/class/requested/join", params);
    },
    options
  );

export const useJoinRegularClassMutation = (
  options?: UseMutationReactQueryOption
) =>
  useMutation(
    ["joinRegularClass"],
    async (params: any) => {
      return await fetcher("/api/class/regular/join", params);
    },
    options
  );

export const useLeaveClassMutation = (options?: UseMutationReactQueryOption) =>
  useMutation(
    ["leaveClass"],
    async (params: any) => {
      return await fetcher("/api/class/requested/leave", params);
    },
    options
  );

export const useLessonsQuery = (options?: UseReactQueryOption) =>
  useQuery<{
    lessons: Lessons[];
  }>(
    ["lessons"],
    async () => {
      return await fetcher("/api/lesson/fetch");
    },
    options
  );
