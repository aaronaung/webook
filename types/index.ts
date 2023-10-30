import { Tables } from "./db.extension";

export type BusinessServiceEvent = Tables<"service_event"> & {
  staffs: Tables<"staff">[];
  service: Tables<"service">;
} & Tables<"service">;

export type BusinessServiceGroup = Tables<"service_group"> & {
  service_events: BusinessServiceEvent[];
};

export type BusinessSchedule = BusinessServiceGroup[];

export type ServiceGroupWithServices = Tables<"service_group"> & {
  services: Tables<"service">[];
};
