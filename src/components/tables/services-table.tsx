import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  AccessorFnColumnDef,
  Row,
  createColumnHelper,
} from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useEffect, useMemo, useState } from "react";
import { RowAction } from "./types";
import Image from "../ui/image";
import { BUCKETS } from "@/src/consts/storage";
import { fetchWithRetry, getTimestampedObjUrl } from "@/src/utils";
import { Service } from "@/types";

const columnHelper = createColumnHelper<Service>();

function SvcImgCell({ row }: { row: Row<Service> }) {
  const [imgExists, setImgExists] = useState<boolean>(false);
  const imgUrl = getTimestampedObjUrl(
    BUCKETS.publicBusinessAssets,
    `services/${row.original.id}`,
    row.original.updated_at,
  );

  useEffect(() => {
    fetchWithRetry(imgUrl, { method: "HEAD" })
      .then(() => {
        setImgExists(true);
      })
      .catch(() => {
        setImgExists(false);
      });
  }, [imgUrl]);

  if (imgExists) {
    return (
      <Image
        className="h-12 w-12 rounded-full"
        src={`${imgUrl}&random=${Date.now()}`} // random forces the image to reload
      ></Image>
    );
  }
  return <></>;
}

type ServicesTableProp = {
  data: Service[];
  onRowAction: (row: Row<Service>, action: RowAction) => void;
};

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
      columnHelper.accessor("questions", {
        header: "",
        enableHiding: true,
      }),
      // columnHelper.accessor("image_url", {
      //   header: "Image",
      //   cell: ({ row }) => <SvcImgCell row={row} />,
      // }),
      columnHelper.accessor("title", {
        header: "Title",
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row }) =>
          // parseFloat is used to remove trailing zeros
          `$${parseFloat(
            (((row.getValue("price") as number) ?? 0) / 100).toFixed(2),
          )}`,
      }),
      columnHelper.accessor("duration", {
        header: "Duration",
        cell: ({ row }) =>
          // parseFloat is used to remove trailing zeros
          `${parseFloat(
            (((row.getValue("duration") as number) ?? 0) / 60000).toFixed(2),
          )} mins`,
      }),
      columnHelper.accessor("booking_limit", {
        header: "Booking limit",
      }),
      columnHelper.accessor("updated_at", {
        header: "Last updated",
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
          id: false,
          questions: false,
        },
      }}
      columns={columns as AccessorFnColumnDef<Service>[]}
      data={data}
    />
  );
}
