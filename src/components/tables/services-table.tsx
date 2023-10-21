import { Tables } from "@/types/db.extension";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Row, createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useMemo } from "react";

const columnHelper = createColumnHelper<Tables<"service">>();

type ServicesTableProp = {
  data: Tables<"service">[];
  onRowAction: (row: Row<Tables<"service">>, action: RowAction) => void;
};

export enum RowAction {
  EDIT,
  DELETE,
}

export default function ServicesTable({
  data,
  onRowAction,
}: ServicesTableProp) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "",
        enableHiding: true,
      }),
      columnHelper.accessor("title", {
        header: "Title",
      }),
      columnHelper.accessor("description", {
        header: "Description",
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row }) =>
          `$${(((row.getValue("price") as number) ?? 0) / 100).toFixed(2)}`,
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
              <PencilSquareIcon
                onClick={() => {
                  onRowAction(row, RowAction.EDIT);
                }}
                className="h-5 w-5 cursor-pointer rounded-full text-secondary-foreground hover:bg-secondary"
              />
              <TrashIcon
                onClick={() => {
                  onRowAction(row, RowAction.DELETE);
                }}
                className=" h-5 w-5 cursor-pointer rounded-full text-destructive hover:bg-secondary"
              />
            </div>
          );
        },
      }),
    ],
    [],
  );

  return (
    <DataTable
      initialState={{
        columnVisibility: {
          id: false,
        },
      }}
      columns={columns}
      data={data}
    />
  );
}
