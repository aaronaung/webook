import { ServiceCategoryWithServices } from "@/types";
import { SupabaseOptions } from "./types";
import { Tables } from "@/types/db.extension";
import { throwIfError } from "./util";
import { CreateLiveStreamMeetingRequest } from "../api/schemas/meeting";
import {
  createLiveStreamForServiceEvent,
  deleteLiveStreamForServiceEvent,
} from "./live-stream";

export const getServiceCategoriesWithServices = async (
  businessId: string,
  { client }: SupabaseOptions,
): Promise<ServiceCategoryWithServices[]> => {
  const serviceCategories = await throwIfError(
    client
      .from("service_categories")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
  );

  const services = await throwIfError(
    client
      .from("services")
      .select("*, questions (*)")
      .in(
        "service_category_id",
        (serviceCategories || []).map((serviceCategory) => serviceCategory.id),
      )
      .order("created_at", { ascending: true }),
  );

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
  return throwIfError(
    client
      .from("service_categories")
      .upsert({ ...(serviceCategory as Tables<"service_categories">) }),
  );
};

export const deleteServiceCategory = async (
  serviceCategoryId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client.from("service_categories").delete().eq("id", serviceCategoryId),
  );
};

export const saveService = async (
  {
    service,
    questionIds,
  }: { service: Partial<Tables<"services">>; questionIds?: string[] },
  { client }: SupabaseOptions,
) => {
  const saved = await throwIfError(
    client
      .from("services")
      .upsert({ ...(service as Tables<"services">) })
      .select("id"),
  );
  if (questionIds) {
    await saveServiceQuestion(saved[0].id, questionIds, { client });
  }
  return saved;
};

export const deleteService = async (
  serviceId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(client.from("services").delete().eq("id", serviceId));
};

/** If createLiveStreamRequest is not passed, we delete the live stream meeting for the event. */
export const saveServiceEvent = async (
  {
    serviceEvent,
    staffIds,
    createLiveStreamRequest,
    deleteLiveStream,
  }: {
    serviceEvent: Partial<Tables<"service_events">>;
    staffIds?: string[];
    createLiveStreamRequest?: CreateLiveStreamMeetingRequest;
    deleteLiveStream?: boolean;
  },
  { client }: SupabaseOptions,
) => {
  const saved = await throwIfError(
    client
      .from("service_events")
      .upsert({ ...(serviceEvent as Tables<"service_events">) })
      .select("id"),
  );

  if (staffIds) {
    await saveServiceEventStaff(saved[0].id, staffIds, { client });
  }
  if (createLiveStreamRequest) {
    await createLiveStreamForServiceEvent(
      saved[0].id,
      createLiveStreamRequest,
      {
        client,
      },
    );
  }
  if (deleteLiveStream) {
    await deleteLiveStreamForServiceEvent(saved[0].id, { client });
  }
  return saved;
};

// todo: This will delete all service event staff for the given service event id, and then upsert the new ones.
export const saveServiceEventStaff = async (
  serviceId: string,
  staffIds: string[],
  { client }: SupabaseOptions,
) => {
  await throwIfError(
    client
      .from("service_events_staffs")
      .delete()
      .eq("service_event_id", serviceId),
  );

  return throwIfError(
    client.from("service_events_staffs").upsert(
      staffIds.map((staffId) => ({
        service_event_id: serviceId,
        staff_id: staffId,
      })),
    ),
  );
};

// This will delete all service questions for the given service id, and then upsert the new ones.
export const saveServiceQuestion = async (
  serviceId: string,
  questionIds: string[],
  { client }: SupabaseOptions,
) => {
  await throwIfError(
    client.from("services_questions").delete().eq("service_id", serviceId),
  );

  return throwIfError(
    client.from("services_questions").upsert(
      questionIds.map((questionId) => ({
        service_id: serviceId,
        question_id: questionId,
      })),
    ),
  );
};

export const deleteServiceEvent = async (
  serviceEventId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client.from("service_events").delete().eq("id", serviceEventId),
  );
};
