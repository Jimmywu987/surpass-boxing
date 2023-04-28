import { RouterOutput } from "@/utils/trpc";

export type UserType = RouterOutput["userRouter"]["fetch"]["users"][0];
