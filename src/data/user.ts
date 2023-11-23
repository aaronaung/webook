import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";

export const getAuthUser = async ({ client }: SupabaseOptions) => {
  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error) throw error;

    if (user) {
      return throwOrData(
        client.from("users").select("*").eq("id", user.id).limit(1).single(),
      );
    }
    return user;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
