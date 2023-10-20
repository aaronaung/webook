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
      <div>
        <PencilSquareIcon className="h-12 w-12" />
        <TrashIcon className="h-12 w-12" />
      </div>;
    },
  }),
];

type ServicesTableProp = {
  data: Tables<"service">[];
};

export default function ServicesTable({ data }: ServicesTableProp) {
  return <DataTable columns={columns} data={data} />;
}
