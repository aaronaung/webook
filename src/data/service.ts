import { ServiceCategoryWithServices } from "@/types";
import { SupabaseOptions } from "./types";
import { Tables } from "@/types/db.extension";
import { throwOrData } from "./util";
import { CreateLiveStreamMeetingRequest } from "../api/schemas/meeting";
import {
  createLiveStreamForServiceEvent,
  deleteLiveStreamForServiceEvent,
} from "./live-stream";

export const getServiceCategoriesWithServices = async (
  businessId: string,
  { client }: SupabaseOptions,
): Promise<ServiceCategoryWithServices[]> => {
  const serviceCategories = await throwOrData(
    client
      .from("service_categories")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
  );

  const services = await throwOrData(
    client
      .from("services")
      .select("*, questions (*)")
      .in(
        "service_category_id",
        (serviceCategories || []).map(
          (serviceCategory: Tables<"service_categories">) => serviceCategory.id,
        ),
      )
      .order("created_at", { ascending: true }),
  );

  // We do client side sorting, since we expect the service groups and services to be in the tens only.
  return (serviceCategories || []).map(
    (serviceCategory: Tables<"service_categories">) => ({
      ...serviceCategory,
      services: (services || []).filter(
        (service: Tables<"services">) =>
          service.service_category_id === serviceCategory.id,
      ),
    }),
  );
};

export const saveServiceCategory = async (
  serviceCategory: Partial<Tables<"service_categories">>,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("service_categories")
      .upsert({ ...(serviceCategory as Tables<"service_categories">) }),
  );
};

export const deleteServiceCategory = async (
  serviceCategoryId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client.from("service_categories").delete().eq("id", serviceCategoryId),
  );
};

export const saveService = async (
  {
    service,
    questionIds,
  }: {
    service: Partial<Tables<"services">>;
    questionIds?: {
      added: string[];
      removed: string[];
    };
  },
  { client }: SupabaseOptions,
) => {
  const saved = await throwOrData(
    client
      .from("services")
      .upsert({ ...(service as Tables<"services">) })
      .select("id")
      .limit(1)
      .single(),
  );
  if (questionIds) {
    await saveServiceQuestion(saved.id, questionIds, { client });
  }
  return saved;
};

export const deleteService = async (
  serviceId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(client.from("services").delete().eq("id", serviceId));
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
    staffIds?: {
      added: string[];
      removed: string[];
    };
    createLiveStreamRequest?: CreateLiveStreamMeetingRequest;
    deleteLiveStream?: boolean;
  },
  { client }: SupabaseOptions,
) => {
  const saved = await throwOrData(
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

export const saveServiceEventStaff = async (
  serviceEventId: string,
  staffIds: {
    added: string[];
    removed: string[];
  },
  { client }: SupabaseOptions,
) => {
  if (staffIds.removed.length > 0) {
    await throwOrData(
      client
        .from("service_events_staffs")
        .delete()
        .eq("service_event_id", serviceEventId)
        .in("staff_id", staffIds.removed),
    );
  }

  if (staffIds.added.length > 0) {
    await throwOrData(
      client.from("service_events_staffs").upsert(
        staffIds.added.map((staffId) => ({
          service_event_id: serviceEventId,
          staff_id: staffId,
        })),
      ),
    );
  }
};

export const saveServiceQuestion = async (
  serviceId: string,
  questionIds: {
    added: string[];
    removed: string[];
  },
  { client }: SupabaseOptions,
) => {
  if (questionIds.removed.length > 0) {
    await throwOrData(
      client
        .from("services_questions")
        .delete()
        .eq("service_id", serviceId)
        .in("question_id", questionIds.removed),
    );
  }

  if (questionIds.added.length > 0) {
    await throwOrData(
      client.from("services_questions").upsert(
        questionIds.added.map((questionId) => ({
          service_id: serviceId,
          question_id: questionId,
        })),
      ),
    );
  }
};

export const deleteServiceEvent = async (
  serviceEventId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client.from("service_events").delete().eq("id", serviceEventId),
  );
};

export const getDetailedServiceEvent = async (
  serviceEventId: string,
  { client }: SupabaseOptions,
) => {
  return await throwOrData(
    client
      .from("service_events")
      .select("*, services(* , questions(*))")
      .eq("id", serviceEventId)
      .single(),
  );
};
