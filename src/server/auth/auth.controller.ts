import { NextResponse } from "next/server";
import { registerSchema } from "@/server/auth/auth.schema";
import { registerUserService } from "@/server/auth/auth.service";

export async function registerController(req: Request) {
  try {
    const body = await req.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const result = await registerUserService(parsed.data);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, email: result.email },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
