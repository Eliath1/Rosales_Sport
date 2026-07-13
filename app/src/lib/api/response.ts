import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export function requestId(): string {
  return `req_${randomUUID().slice(0, 8)}`;
}

export function jsonOk<T>(data: T, status = 200, meta?: Record<string, unknown>) {
  return NextResponse.json(
    { data, meta: { requestId: requestId(), ...meta } },
    { status },
  );
}

export function jsonCreated<T>(data: T, meta?: Record<string, unknown>) {
  return jsonOk(data, 201, meta);
}

export function jsonError(
  code: string,
  message: string,
  status: number,
  details?: Array<{ field: string; message: string }>,
) {
  return NextResponse.json(
    {
      error: { code, message, ...(details ? { details } : {}) },
      meta: { requestId: requestId() },
    },
    { status },
  );
}
