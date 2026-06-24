import { handlers } from "@/lib/auth";

/** next-auth route handlers — mounts /api/auth/* (signin, callback, session…). */
export const { GET, POST } = handlers;
