// import { registerController } from "@/controllers/authController";
import { registerController } from "@/server/auth/auth.controller";

export async function POST(req: Request) {
  return registerController(req);
}
