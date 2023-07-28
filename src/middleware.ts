// middleware.ts
import { NextRequest, NextFetchEvent, NextResponse } from "next/server";
const RESTRICTED_COUNTRIES = ["UK"];
export async function middleware(request: NextRequest, _next: NextFetchEvent) {
  const res = NextResponse.next();
  const country = request.geo?.country ?? "";
  console.log("country", country);
  if (RESTRICTED_COUNTRIES.includes(country)) {
    return NextResponse.rewrite(new URL("/classes", request.url));
  }
  const { nextUrl: url } = request;
  url.searchParams.set("country", country);
  return NextResponse.rewrite(url);
}
