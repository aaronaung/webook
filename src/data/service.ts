import { ServiceGroupWithServices } from "@/types";
import { SupabaseOptions } from "./types";
import { Tables } from "@/types/db.extension";

export const getServiceGroupsWithServices = async (
  businessId: string,
  { client }: SupabaseOptions,
): Promise<ServiceGroupWithServices[]> => {
  const { data: serviceGroups, error: serviceGroupsError } = await client
    .from("service_group")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });
  if (serviceGroupsError) throw serviceGroupsError;

  const { data: services, error: servicesError } = await client
    .from("service")
    .select("*")
    .in(
      "service_group_id",
      (serviceGroups || []).map((serviceGroup) => serviceGroup.id),
    )
    .order("created_at", { ascending: true });
  if (servicesError) throw servicesError;

  // We do client side sorting, since we expect the service groups and services to be in the tens only.
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

export const deleteServiceGroup = async (
  serviceGroupId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client
    .from("service_group")
    .delete()
    .eq("id", serviceGroupId);
  if (error) throw error;
};

export const saveService = async (
  service: Partial<Tables<"service">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("service")
    .upsert({ ...(service as Tables<"service">) })
    .select();
  if (error) throw error;
  return data;
};

export const deleteService = async (
  serviceId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client.from("service").delete().eq("id", serviceId);
  if (error) throw error;
};

export const saveServiceSlot = async (
  serviceSlot: Partial<Tables<"service_slot">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("service_slot")
    .upsert({ ...(serviceSlot as Tables<"service_slot">) })
    .select();
  if (error) throw error;
  return data;
};

export const deleteServiceSlot = async (
  serviceSlotId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client
    .from("service_slot")
    .delete()
    .eq("id", serviceSlotId);
  if (error) throw error;
};
