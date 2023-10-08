import { Tables } from "./db.extension";

export type BusinessServiceSlot = Tables<"service_slot"> & {
  staffs: Tables<"staff">[];
} & Tables<"service">;
export type BusinessServiceGroup = {
  title: string;
  description: string;
  is_horizontal: boolean;
  service_slots: BusinessServiceSlot[];
};
