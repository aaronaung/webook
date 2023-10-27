import { SupabaseOptions } from "./types";

export const getAuthUser = async ({ client }: SupabaseOptions) => {
  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
