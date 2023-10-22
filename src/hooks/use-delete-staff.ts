import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStaff } from "../api/staff";
import { supaClientComponentClient } from "../api/clients/browser";
import { BUCKETS } from "../consts/storage";

export const useDeleteStaff = (businessId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staffId: string) => {
      await deleteStaff(staffId, {
        client: supaClientComponentClient(),
      });
      return supaClientComponentClient()
        .storage.from(BUCKETS.publicBusinessAssets)
        .remove([`staff_headshots/${staffId}`]);
    },
    meta: { errorMessage: "Failed to delete staff" },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staffs", businessId],
      });
    },
  });
};
