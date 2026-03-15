import { NextResponse } from "next/server";
import { routeCommand } from "@/lib/openclaw/router";
import { execute } from "@/lib/openclaw/executor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
const message =
  typeof body?.message === "string"
    ? body.message.trim()
    : typeof body?.command === "string"
    ? body.command.trim()
    : "";

    if (!message) {
      return NextResponse.json(
        {
          ok: false,
          error: "Message is required",
        },
        { status: 400 }
      );
    }

    const routed = routeCommand({ command: message });
    const result = await execute(message, routed, {
      studioPrompt:
        typeof body?.studioPrompt === "string" ? body.studioPrompt : undefined,
      studioMode:
        body?.studioMode === "post" || body?.studioMode === "thread"
          ? body.studioMode
          : undefined,
      regenerateVersion:
        typeof body?.regenerateVersion === "number"
          ? body.regenerateVersion
          : 0,
      studioTopic:
        typeof body?.studioTopic === "string" ? body.studioTopic : undefined,
    });

    return NextResponse.json(
      {
        ok: true,
        routed,
        result,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("OPENCLAW_API_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}