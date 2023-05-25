import {
  endOfDay,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  startOfWeek,
  endOfYear,
  startOfYear,
  startOfDay,
} from "date-fns";
import { utcToZonedTime, formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
const HONG_KONG_TIME_ZONE = "Asia/Hong_Kong";
export const getFormatTimeZone = ({
  date = new Date(),
  format = "yyyy-MM-dd",
  tz = HONG_KONG_TIME_ZONE,
}: {
  date?: Date;
  format?: string;
  tz?: string;
}) => {
  return formatInTimeZone(date, tz, format);
};

const calcZonedDate = (
  date: Date,
  tz = HONG_KONG_TIME_ZONE,
  fn: typeof startOfDay
) => {
  const inputZoned = utcToZonedTime(date, tz);
  const fnZoned = fn(inputZoned);
  return zonedTimeToUtc(fnZoned, tz);
};

export const getZonedEndOfDay = (date: Date, tz = HONG_KONG_TIME_ZONE) => {
  return calcZonedDate(date, tz, endOfDay);
};

export const getZonedEndOfWeek = (date: Date, tz = HONG_KONG_TIME_ZONE) => {
  return calcZonedDate(date, tz, endOfWeek);
};

export const getZonedEndOfMonth = (date: Date, tz = HONG_KONG_TIME_ZONE) => {
  return calcZonedDate(date, tz, endOfMonth);
};

export const getZonedEndOfYear = (date: Date, tz = HONG_KONG_TIME_ZONE) => {
  return calcZonedDate(date, tz, endOfYear);
};

export const getZonedStartOfDay = (date: Date, tz = HONG_KONG_TIME_ZONE) => {
  return calcZonedDate(date, tz, startOfDay);
};

export const getZonedStartOfWeek = (date: Date, tz = HONG_KONG_TIME_ZONE) => {
  return calcZonedDate(date, tz, startOfWeek);
};

export const getZonedStartOfMonth = (date: Date, tz = HONG_KONG_TIME_ZONE) => {
  return calcZonedDate(date, tz, startOfMonth);
};

export const getZonedStartOfYear = (date: Date, tz = HONG_KONG_TIME_ZONE) => {
  return calcZonedDate(date, tz, startOfYear);
};
