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
      const dbUser = await throwOrData(
        client
          .from("users")
          .select("*")
          .eq("id", user.id)
          .limit(1)
          .maybeSingle(),
      );
      if (
        dbUser != null &&
        (dbUser.first_name === null || dbUser.last_name === null) &&
        user.user_metadata?.full_name
      ) {
        return await throwOrData(
          client
            .from("users")
            .update({
              first_name: user.user_metadata.full_name.split(" ")[0],
              last_name: user.user_metadata.full_name.split(" ")[1],
            })
            .eq("id", user.id)
            .limit(1)
            .maybeSingle(),
        );
      } else {
        return dbUser;
      }
    }
    return user;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
