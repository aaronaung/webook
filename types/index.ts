import { Tables } from "./db.extension";

// BusinessSchedule is a list of BusinessServiceGroup which contains a list of BusinessServiceEvent.
export type BusinessSchedule = BusinessServiceGroup[];
export type BusinessServiceGroup = Tables<"service_group"> & {
  service_events: BusinessServiceEvent[];
};
export type BusinessServiceEvent = Tables<"service_event"> & {
  color: string;
  staffs: Tables<"staff">[];
  service: Tables<"service">;
  live_stream?: Tables<"service_event_live_stream">;
} & Tables<"service">;

export type ServiceGroupWithServices = Tables<"service_group"> & {
  services: Tables<"service">[];
};

// BusinessData contains all the data that's configured in the business without the individual schedule events.
export type BusinessData = {
  service_groups: Tables<"service_group">[];
  services: (Tables<"service"> & { color: string })[];
  staffs: Tables<"staff">[];
};
