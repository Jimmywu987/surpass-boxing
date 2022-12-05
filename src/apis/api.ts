import { req } from "./https";

export async function createUser(params: any) {
  return await req("post", "/api/auth/sign-up", params);
}
