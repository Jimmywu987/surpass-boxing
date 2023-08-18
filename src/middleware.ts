import { NextRequest, NextFetchEvent, NextResponse } from "next/server";

export async function middleware(request: NextRequest, _next: NextFetchEvent) {
  const res = NextResponse.next();
  const country = request.geo?.country ?? "";

  if (country === "GB" && request.url.includes("/classes")) {
    return NextResponse.rewrite(new URL("/lesson", request.url));
  }
  if (country !== "GB" && request.url.includes("/lesson")) {
    return NextResponse.rewrite(new URL("/classes", request.url));
  }
  return res;
}
