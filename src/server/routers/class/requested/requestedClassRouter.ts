import { create } from "@/server/routers/class/requested/create";
import { update } from "@/server/routers/class/requested/update";
import { statusUpdate } from "@/server/routers/class/requested/statusUpdate";
import { leave } from "@/server/routers/class/requested/leave";
import { join } from "@/server/routers/class/requested/join";
import { fetch } from "@/server/routers/class/requested/fetch";
import { router } from "@/server/trpc";

export const requestedClassRouter = router({
  create,
  update,
  statusUpdate,
  leave,
  join,
  fetch,
});
