import { ServiceGroupWithServices } from "@/types";
import { SupabaseOptions } from "./api";

export const getServiceGroupsWithServices = async (
  businessId: string,
  { client }: SupabaseOptions,
): Promise<ServiceGroupWithServices[]> => {
  const { data: serviceGroups } = await client
    .from("service_group")
    .select("*")
    .eq("business_id", businessId);

  const { data: services } = await client
    .from("service")
    .select("*")
    .in(
      "service_group_id",
      (serviceGroups || []).map((serviceGroup) => serviceGroup.id),
    );

  return (serviceGroups || []).map((serviceGroup) => ({
    ...serviceGroup,
    services: (services || []).filter(
      (service) => service.service_group_id === serviceGroup.id,
    ),
  }));
};
