import { jsonOk } from "@rs/shared/api/response";

export async function GET() {
  return jsonOk({ status: "ok", service: "rosales-sport-web" });
}
