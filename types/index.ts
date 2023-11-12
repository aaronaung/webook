import { Tables } from "./db.extension";

// BusinessSchedule is a list of BusinessServiceCategory which contains a list of BusinessServiceEvent.
export type BusinessSchedule = BusinessServiceCategory[];
export type BusinessServiceCategory = Tables<"service_categories"> & {
  service_events: BusinessServiceEvent[];
};
export type BusinessServiceEvent = Tables<"service_events"> & {
  color: string;
  staffs: Tables<"staffs">[];
  service: Tables<"services">;
  live_stream?: Tables<"service_event_live_streams">;
} & Tables<"services">;

export type ServiceCategoryWithServices = Tables<"service_categories"> & {
  services: Service[];
};

export type Service = Tables<"services"> & { questions: Tables<"questions">[] };

// BusinessData contains all the data that's configured in the business without the individual schedule events.
export type BusinessData = {
  service_categories: Tables<"service_categories">[];
  services: (Tables<"services"> & { color: string })[];
  staffs: Tables<"staffs">[];
};
