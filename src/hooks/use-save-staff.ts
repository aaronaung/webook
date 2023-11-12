import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveStaff } from "../data/staff";
import { Tables } from "@/types/db.extension";
import { supaClientComponentClient } from "../data/clients/browser";
import { BUCKETS, STORAGE_DIR_PATHS } from "../consts/storage";
import { sleep } from "../utils";

export const useSaveStaff = (
  businessId: string,
  { onSettled }: { onSettled?: () => void } = {},
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: {
      newStaff: Partial<Tables<"staffs">>;
      headshotFile?: File;
    }) => {
      const updatedStaff = await saveStaff(variables.newStaff, {
        client: supaClientComponentClient(),
      });
      if (variables.headshotFile) {
        const imgVersion = new Date(updatedStaff[0].updated_at!).getTime();
        await supaClientComponentClient()
          .storage.from(BUCKETS.publicBusinessAssets)
          .upload(
            `${STORAGE_DIR_PATHS.staffHeadshots}/${updatedStaff[0].id}?version=${imgVersion}`,
            variables.headshotFile,
            {
              upsert: true,
            },
          );

        await sleep(1000); // introduce artificial delay to let the image upload settle.
      }
    },
    meta: { errorMessage: "Failed to save staff" },
    onSuccess: () => {
      console.log("SHOULD INVALIDATE QUERIES", businessId);
      queryClient.invalidateQueries({
        queryKey: ["staffs", businessId],
      });
    },
    onSettled,
  });
};
