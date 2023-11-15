import { SupabaseOptions } from "./types";

export const getAuthUser = async ({ client }: SupabaseOptions) => {
  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
