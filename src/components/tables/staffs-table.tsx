import { Tables } from "@/types/db.extension";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Row, createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useEffect, useMemo, useState } from "react";
import { RowAction } from "./types";
import Image from "../ui/image";
import { fetchWithRetry, getStaffHeadshotUrl } from "@/src/utils";

const columnHelper = createColumnHelper<Tables<"staff">>();

function StaffHeadshotCell({ row }: { row: Row<Tables<"staff">> }) {
  const [headshotExists, setHeadshotExists] = useState<boolean>(false);
  const headshotUrl = getStaffHeadshotUrl(
    row.original.id,
    row.original.updated_at,
  );

  useEffect(() => {
    fetchWithRetry(headshotUrl, { method: "HEAD" })
      .then(() => {
        setHeadshotExists(true);
      })
      .catch(() => {
        setHeadshotExists(false);
      });
  }, [headshotUrl]);

  if (headshotExists) {
    return (
      <Image
        className="h-12 w-12 self-center rounded-full"
        src={`${headshotUrl}&random=${Date.now()}`} // random forces the image to reload
      ></Image>
    );
  }
  return <></>;
}

type StaffTableProp = {
  data: Tables<"staff">[];
  onRowAction: (row: Row<Tables<"staff">>, action: RowAction) => void;
};

export default function StaffsTable({ data, onRowAction }: StaffTableProp) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "",
        enableHiding: true,
      }),
      columnHelper.display({
        header: "Headshot",
        cell: ({ row }) => <StaffHeadshotCell row={row} />,
      }),
      columnHelper.accessor("first_name", {
        header: "First name",
      }),
      columnHelper.accessor("last_name", {
        header: "Last name",
      }),
      columnHelper.accessor("email", {
        header: "Email",
      }),
      columnHelper.accessor("instagram_handle", {
        header: "Instagram",
      }),
      columnHelper.accessor("updated_at", {
        header: "Last updated",
        cell: ({ row }) => {
          return new Date(row.getValue("updated_at") as string).toLocaleString(
            "en-US",
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
