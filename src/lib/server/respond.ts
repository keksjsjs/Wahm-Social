/** Uniform JSON responses + error mapping for API route handlers. */
import { NextResponse } from "next/server";
import { PlatformError, type DataSource } from "../platforms/types";

export function ok<T>(data: T, source: DataSource = "live", notice?: string, init?: ResponseInit) {
  return NextResponse.json({ ok: true, source, fetchedAt: Date.now(), data, ...(notice ? { notice } : {}) }, init);
}

export function fail(e: unknown) {
  if (e instanceof PlatformError) {
    return NextResponse.json({ ok: false, error: { code: e.code, message: e.message } }, { status: e.status });
  }
  console.error("[api] unexpected error", e);
  return NextResponse.json({ ok: false, error: { code: "internal", message: "Unexpected server error" } }, { status: 500 });
}

/** Wrap a handler so thrown PlatformErrors become JSON responses. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      return fail(e);
    }
  };
}
