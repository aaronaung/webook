import { SupabaseOptions } from "./types";
import { Tables } from "@/types/db.extension";
import { throwOrData } from "./util";
import { CreateLiveStreamMeetingRequest } from "../api/schemas/meeting";
import {
  createLiveStreamForServiceEvent,
  deleteLiveStreamForServiceEvent,
} from "./live-stream";

export type GetServicesResponse = GetServicesResponseSingle[];
export type GetServicesResponseSingle = Awaited<
  ReturnType<typeof getServices>
>[0];
export const getServices = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return await throwOrData(
    client
      .from("services")
      .select(
        "*, questions (*), availability_schedule:availability_schedules(*)",
      )
      .eq("business_id", businessId)
      .order("id"), // just so there's a consistent order
  );
};

export type GetServiceResponse = Awaited<ReturnType<typeof getService>>;
export const getService = async (
  serviceId: string,
  { client }: SupabaseOptions,
) => {
  return await throwOrData(
    client
      .from("services")
      .select(
        "*, business:businesses(*), questions (*), availability_schedule:availability_schedules(*)",
      )
      .eq("id", serviceId)
      .single(),
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

export type GetDetailedServiceEventResponse = Awaited<
  ReturnType<typeof getDetailedServiceEvent>
>;
export const getDetailedServiceEvent = async (
  serviceEventId: string,
  { client }: SupabaseOptions,
) => {
  return await throwOrData(
    client
      .from("service_events")
      .select("*, service:services(* , questions(*))")
      .eq("id", serviceEventId)
      .single(),
  );
};

export const getServicesWithAvailabilitySchedule = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  const services = await throwOrData(
    client
      .from("services")
      .select("*, availability_schedules(*)")
      .eq("business_id", businessId)
      .not("availability_schedules", "is", null),
  );

  return services;
};
