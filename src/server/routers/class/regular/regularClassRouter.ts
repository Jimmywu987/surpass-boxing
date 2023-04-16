import { router } from "@/server/trpc";
import { remove } from "@/server/routers/class/regular/remove";
import { join } from "@/server/routers/class/regular/join";
import { create } from "@/server/routers/class/regular/create";
import { fetch } from "@/server/routers/class/regular/fetch";

export const regularClassRouter = router({
  fetch,
  join,
  remove,
  create,
});
