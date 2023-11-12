import { ServiceCategoryWithServices } from "@/types";
import { SupabaseOptions } from "./types";
import { Tables } from "@/types/db.extension";

export const getServiceCategoriesWithServices = async (
  businessId: string,
  { client }: SupabaseOptions,
): Promise<ServiceCategoryWithServices[]> => {
  const { data: serviceCategories, error: serviceCategoriesError } =
    await client
      .from("service_categories")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true });
  if (serviceCategoriesError) throw serviceCategoriesError;

  const { data: services, error: servicesError } = await client
    .from("services")
    .select("*, questions (*)")
    .in(
      "service_category_id",
      (serviceCategories || []).map((serviceCategory) => serviceCategory.id),
    )
    .order("created_at", { ascending: true });
  if (servicesError) throw servicesError;

  // We do client side sorting, since we expect the service groups and services to be in the tens only.
  return (serviceCategories || []).map((serviceCategory) => ({
    ...serviceCategory,
    services: (services || []).filter(
      (service) => service.service_category_id === serviceCategory.id,
    ),
  }));
};

export const saveServiceCategory = async (
  serviceCategory: Partial<Tables<"service_categories">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("service_categories")
    .upsert({ ...(serviceCategory as Tables<"service_categories">) })
    .select();
  if (error) throw error;
  return data;
};

export const deleteServiceCategory = async (
  serviceCategoryId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client
    .from("service_categories")
    .delete()
    .eq("id", serviceCategoryId);
  if (error) throw error;
};

export const saveService = async (
  service: Partial<Tables<"services">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("services")
    .upsert({ ...(service as Tables<"services">) })
    .select();
  if (error) throw error;
  return data;
};

export const deleteService = async (
  serviceId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client.from("services").delete().eq("id", serviceId);
  if (error) throw error;
};

export const saveServiceEvent = async (
  serviceEvent: Partial<Tables<"service_events">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("service_events")
    .upsert({ ...(serviceEvent as Tables<"service_events">) })
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
    .from("service_events_staffs")
    .delete()
    .eq("service_event_id", serviceId);
  if (deleteError) throw deleteError;

  const { error: upsertError } = await client
    .from("service_events_staffs")
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
    .from("services_questions")
    .delete()
    .eq("service_id", serviceId);
  if (deleteError) throw deleteError;

  const { error: upsertError } = await client.from("services_questions").upsert(
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
    .from("service_events")
    .delete()
    .eq("id", serviceEventId);
  if (error) throw error;
};
