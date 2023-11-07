import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStaff } from "../data/staff";
import { supaClientComponentClient } from "../data/clients/browser";
import { BUCKETS, STORAGE_DIR_PATHS } from "../consts/storage";

export const useDeleteStaff = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      await deleteStaff(staffId, {
        client: supaClientComponentClient(),
      });
      return supaClientComponentClient()
        .storage.from(BUCKETS.publicBusinessAssets)
        .remove([`${STORAGE_DIR_PATHS.staffHeadshots}/${staffId}`]);
    },
    meta: { errorMessage: "Failed to delete staff" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staffs", businessId],
      });
    },
  });
};
