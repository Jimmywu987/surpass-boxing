import { req } from "./https";
import {
  useQuery,
  useMutation,
  UseMutationOptions,
  UseQueryOptions,
} from "react-query";
import {
  BookingTimeSlots,
  BookingTimeSlotStatusEnum,
  ClassesType,
  Lessons,
  News,
  RegularBookingTimeSlots,
  User,
  UserOnBookingTimeSlots,
} from "@prisma/client";
import { SortedBookingTimeSlotsType } from "@/types/timeSlots";
import { UserType } from "@/types";

const fetcher = async (url: string, params?: any) => {
  const res = await req("post", url, params);
  if (res && res.data && res.status === 201) {
    return res.data;
  }
  throw Error(res?.data.errorMessage);
};

export const useCreateClassTypeMutation = () =>
  useMutation(["createClassType"], async (params: any) => {
    return await fetcher("/api/class/create", params);
  });
export const useRemoveClassTypeMutation = () =>
  useMutation(["removeClassType"], async (params: any) => {
    return await fetcher("/api/class/remove", params);
  });
export const useCreateRegularClassMutation = () =>
  useMutation(["createRegularClass"], async (params: any) => {
    return await fetcher("/api/class/regular/create", params);
  });

export const useCreateRequestedClassMutation = () =>
  useMutation(["createRequestedClass"], async (params: any) => {
    return await fetcher("/api/class/requested/create", params);
  });

export const useUpdateRequestedClassMutation = () =>
  useMutation(["updateRequestedClass"], async (params: any) => {
    return await fetcher("/api/class/requested/update", params);
  });

export const useCreateUserMutation = () =>
  useMutation(["createUser"], async (params: any) => {
    return await fetcher("/api/auth/sign-up", params);
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

export const useClassTypeQuery = () =>
  useQuery<{ classTypes: ClassesType[] }>(["classTypes"], async () => {
    return await fetcher("/api/class/fetch");
  });

export const useBookingTimeSlotQuery = ({ ids }: { ids: string[] }) =>
  useQuery<{ bookingTimeSlots: BookingTimeSlots[] }>(
    ["bookingTimeSlot", ids],
    async () => {
      return await fetcher("/api/booking-time-slot/fetch", {
        ids,
      });
    }
  );

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

export const useAddClassMutation = () =>
  useMutation(["addClass"], async (params: any) => {
    return await fetcher("/api/class/add", params);
  });
