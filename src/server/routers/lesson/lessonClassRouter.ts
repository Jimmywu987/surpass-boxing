import { router } from "@/server/trpc";
import { remove } from "@/server/routers/lesson/remove";
import { fetch } from "@/server/routers/lesson/fetch";
import { addLesson } from "@/server/routers/lesson/add";

export const lessonClassRouter = router({
  fetch,
  remove,
  addLesson,
});
