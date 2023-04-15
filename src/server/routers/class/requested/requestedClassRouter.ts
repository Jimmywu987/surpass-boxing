import { create } from "@/server/routers/class/requested/create";
import { update } from "@/server/routers/class/requested/update";
import { statusUpdate } from "@/server/routers/class/requested/statusUpdate";
import { router } from "@/server/trpc";

export const requestedClassRouter = router({
  create,
  update,
  statusUpdate,
});
