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
    .select("*, question (*)")
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

export const saveServiceEvent = async (
  serviceEvent: Partial<Tables<"service_event">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("service_event")
    .upsert({ ...(serviceEvent as Tables<"service_event">) })
    .select();
  if (error) throw error;
  return data;
};

// This will delete all service event staff for the given service event id, and then upsert the new ones.
export const saveServiceEventStaff = async (
  serviceId: string,
  staffIds: string[],
  { client }: SupabaseOptions,
) => {
  const { error: deleteError } = await client
    .from("service_event_staff")
    .delete()
    .eq("service_event_id", serviceId);
  if (deleteError) throw deleteError;

  const { error: upsertError } = await client
    .from("service_event_staff")
    .upsert(
      staffIds.map((staffId) => ({
        service_event_id: serviceId,
        staff_id: staffId,
      })),
    );
  if (upsertError) throw upsertError;
};

// This will delete all service questions for the given service id, and then upsert the new ones.
export const saveServiceQuestion = async (
  serviceId: string,
  questionIds: string[],
  { client }: SupabaseOptions,
) => {
  const { error: deleteError } = await client
    .from("service_question")
    .delete()
    .eq("service_id", serviceId);
  if (deleteError) throw deleteError;

  const { error: upsertError } = await client.from("service_question").upsert(
    questionIds.map((questionId) => ({
      service_id: serviceId,
      question_id: questionId,
    })),
  );
  if (upsertError) throw upsertError;
};

export const deleteServiceEvent = async (
  serviceEventId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client
    .from("service_event")
    .delete()
    .eq("id", serviceEventId);
  if (error) throw error;
};
