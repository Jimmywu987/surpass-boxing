import { router } from "@/server/trpc";
import { remove } from "@/server/routers/coaches/remove";
import { fetch } from "@/server/routers/coaches/fetch";
import { addTitle } from "@/server/routers/coaches/add";
import { updateDisplay } from "@/server/routers/coaches/updateDisplay";
import { fetchForPublic } from "@/server/routers/coaches/fetchForPublic";

export const coachInfosRouter = router({
  fetch,
  remove,
  addTitle,
  updateDisplay,
  fetchForPublic,
});
