import { Tables } from "./db.extension";

export type BusinessServiceSlot = Tables<"service_slot"> & {
  staffs: Tables<"staff">[];
  service: Tables<"service">;
} & Tables<"service">;

export type BusinessServiceGroup = Tables<"service_group"> & {
  service_slots: BusinessServiceSlot[];
};

export type BusinessSchedule = BusinessServiceGroup[];
