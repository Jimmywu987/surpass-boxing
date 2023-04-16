import { router } from "@/server/trpc";
import { remove } from "@/server/routers/class/regular/remove";
import { join } from "@/server/routers/class/regular/join";

export const regularClassRouter = router({
  join,
  remove,
});
