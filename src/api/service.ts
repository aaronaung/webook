import { ServiceGroupWithServices } from "@/types";
import { SupabaseOptions } from "./api";
import { Tables } from "@/types/db.extension";

export const getServiceGroupsWithServices = async (
  businessId: string,
  { client }: SupabaseOptions,
): Promise<ServiceGroupWithServices[]> => {
  const { data: serviceGroups, error: serviceGroupsError } = await client
    .from("service_group")
    .select("*")
    .eq("business_id", businessId);
  if (serviceGroupsError) throw serviceGroupsError;

  const { data: services, error: servicesError } = await client
    .from("service")
    .select("*")
    .in(
      "service_group_id",
      (serviceGroups || []).map((serviceGroup) => serviceGroup.id),
    );
  if (servicesError) throw servicesError;

  return (serviceGroups || []).map((serviceGroup) => ({
    ...serviceGroup,
    services: (services || []).filter(
      (service) => service.service_group_id === serviceGroup.id,
    ),
  }));
};

export const saveServiceGroup = async (
  serviceGroup: Partial<Tables<"service_group">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("service_group")
    .upsert({ ...(serviceGroup as Tables<"service_group">) })
    .select();
  if (error) throw error;
  return data;
};
