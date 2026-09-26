import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { getSession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";
import { prisma } from "@/lib/db";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function jsonError(error: unknown) {
  if (error instanceof ApiError)
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
          details: error.flatten(),
        },
      },
      { status: 400 },
    );
  console.error(
    "API operation failed",
    error instanceof Error ? error.name : "unknown",
  );
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "The request could not be completed",
      },
    },
    { status: 500 },
  );
}
export async function parseBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T,
): Promise<z.infer<T>> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "JSON content type required",
    );
  const raw = await request.text();
  if (raw.length > 200_000)
    throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request is too large");
  try {
    return schema.parse(JSON.parse(raw));
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new ApiError(400, "INVALID_JSON", "Invalid JSON body");
    throw error;
  }
}
export function mutationGuard(request: NextRequest) {
  if (!isSameOrigin(request))
    throw new ApiError(
      403,
      "INVALID_ORIGIN",
      "Request origin was not accepted",
    );
}
export async function requireUser() {
  const session = await getSession();
  if (
    !session?.user?.id ||
    !session.user.organizationId ||
    session.user.role === "INTERNAL_ADMIN"
  )
    throw new ApiError(401, "UNAUTHORIZED", "Sign in to continue");
  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { status: true },
  });
  if (!org || org.status === "SUSPENDED")
    throw new ApiError(
      403,
      "TENANT_UNAVAILABLE",
      "Organization access is unavailable",
    );
  return session.user;
}
export async function requireManager() {
  const user = await requireUser();
  if (user.role !== "OWNER" && user.role !== "ADMIN")
    throw new ApiError(403, "FORBIDDEN", "Manager access required");
  return user;
}
export async function requireInternalAdmin() {
  const session = await getSession();
  if (!session?.user?.id || session.user.role !== "INTERNAL_ADMIN")
    throw new ApiError(403, "FORBIDDEN", "Internal admin access required");
  return session.user;
}
export const ids = z.string().cuid();
