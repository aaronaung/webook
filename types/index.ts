import { Tables } from "./db.extension";

// BusinessSchedule is a list of BusinessServiceCategory which contains a list of BusinessServiceEvent.
export type BusinessSchedule = ServiceCategory[];

// BusinessData contains all the data that's configured in the business without the individual schedule events.
export type BusinessData = {
  service_categories: Tables<"service_categories">[];
  services: Service[];
  staffs: Tables<"staffs">[];
};

export type Service = Tables<"services"> & {
  questions: Tables<"questions">[];
  color?: string;
};

export type ServiceCategory = Tables<"service_categories"> & {
  service_events: ServiceEvent[];
};

export type ServiceEvent = Tables<"service_events"> & {
  color: string;
  staffs: Tables<"staffs">[];
  service: Service;
  live_stream?: Tables<"service_event_live_streams">;
} & Tables<"services">;

export type ServiceCategoryWithServices = Tables<"service_categories"> & {
  services: Service[];
};
