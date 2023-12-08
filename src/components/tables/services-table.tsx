import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  AccessorFnColumnDef,
  Row,
  createColumnHelper,
} from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useMemo } from "react";
import { RowAction } from "./types";
import { GetServicesResponseSingle } from "@/src/data/service";
import Link from "next/link";
import { Button } from "../ui/button";
import { PRICING_INTERVALS } from "../forms/save-availability-based-service-form";

const columnHelper = createColumnHelper<GetServicesResponseSingle>();

type ServicesTableProp = {
  data: GetServicesResponseSingle[];
  onRowAction: (row: Row<GetServicesResponseSingle>, action: RowAction) => void;
  hiddenColumns?: Partial<{ [K in keyof GetServicesResponseSingle]: boolean }>;
};

export default function ServicesTable({
  data,
  onRowAction,
  hiddenColumns = {},
}: ServicesTableProp) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "",
        enableHiding: true,
      }),
      columnHelper.accessor("questions", {
        header: "",
        enableHiding: true,
      }),
      columnHelper.accessor("availability_schedule", {
        header: "Availability schedule",
        enableHiding: true,
        cell: ({ row }) => {
          const schedule = row.original.availability_schedule;
          if (schedule) {
            return (
              <Link href={`/app/business/availability?id=${schedule.id}`}>
                <Button className="p-0" variant={"link"}>
                  {schedule.name}
                </Button>
              </Link>
            );
          }
        },
      }),

      columnHelper.accessor("title", {
        header: "Title",
        enableHiding: true,
      }),
      columnHelper.accessor("price", {
        header: "Price",
        enableHiding: true,
        cell: ({ row }) => {
          const price = `$${parseFloat(
            (((row.getValue("price") as number) ?? 0) / 100).toFixed(2),
          )}`;
          if (row.original.availability_schedule_id) {
            return `${price} ${PRICING_INTERVALS[row.original.duration]}`;
          }
          // parseFloat is used to remove trailing zeros
          return price;
        },
      }),
      columnHelper.accessor("duration", {
        header: "Duration",
        enableHiding: true,
        cell: ({ row }) => {
          if (row.original.availability_schedule_id) {
            return "";
          }
          // parseFloat is used to remove trailing zeros
          return `${parseFloat(
            (((row.getValue("duration") as number) ?? 0) / 60000).toFixed(2),
          )} mins`;
        },
      }),
      columnHelper.accessor("booking_limit", {
        header: "Booking limit",
        enableHiding: true,
      }),
      columnHelper.accessor("updated_at", {
        header: "Last updated",
        enableHiding: true,
        cell: ({ row }) => {
          return new Date(row.original.updated_at!).toLocaleString();
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
    [onRowAction],
  );

  return (
    <DataTable
      initialState={{
        columnVisibility: {
          id: !hiddenColumns.id,
          questions: !hiddenColumns.questions,
          availability_schedule: !hiddenColumns.availability_schedule,
          title: !hiddenColumns.title,
          price: !hiddenColumns.price,
          duration: !hiddenColumns.duration,
          booking_limit: !hiddenColumns.booking_limit,
          updated_at: !hiddenColumns.updated_at,
        },
      }}
      columns={columns as AccessorFnColumnDef<GetServicesResponseSingle>[]}
      data={data}
    />
  );
}
