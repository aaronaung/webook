import { Tables } from "@/types/db.extension";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";

const columnHelper = createColumnHelper<Tables<"service">>();
const columns = [
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor("description", {
    header: "Description",
  }),
  columnHelper.accessor("price", {
    header: "Price",
  }),
  columnHelper.accessor("booking_limit", {
    header: "Booking limit",
  }),
  columnHelper.accessor("image_url", {
    header: "Image",

    cell: ({ row }) => {
      if (!row.getValue("image_url")) {
        return <></>;
      }
      return (
        <img
          className="h-12 w-12 rounded-full"
          src={row.getValue("image_url")}
        ></img>
      );
    },
  }),
  columnHelper.display({
    id: "actions",

    cell: ({ row }) => {
      return (
        <div className="flex gap-x-3">
          <PencilSquareIcon className="h-5 w-5 cursor-pointer rounded-full text-secondary-foreground hover:bg-secondary" />
          <TrashIcon className=" h-5 w-5 cursor-pointer rounded-full text-destructive hover:bg-secondary" />
        </div>
      );
    },
  }),
];

type ServicesTableProp = {
  data: Tables<"service">[];
};

export default function ServicesTable({ data }: ServicesTableProp) {
  return <DataTable columns={columns} data={data} />;
}
