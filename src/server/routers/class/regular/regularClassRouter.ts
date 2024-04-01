import { router } from "@/server/trpc";
import { remove } from "@/server/routers/class/regular/remove";
import { join } from "@/server/routers/class/regular/join";
import { removeHide } from "@/server/routers/class/regular/removeHide";
import { create } from "@/server/routers/class/regular/create";
import { fetch } from "@/server/routers/class/regular/fetch";
import { hide } from "@/server/routers/class/regular/hide";

export const regularClassRouter = router({
  fetch,
  join,
  remove,
  create,
  hide,
  removeHide,
});
