"use client";
import { SaveStaffDialog } from "@/src/components/dialogs/save-staff-dialog";
import { SaveStaffFormSchemaType } from "@/src/components/forms/save-staff-form";
import EmptyState from "@/src/components/common/empty-state";
import StaffsTable from "@/src/components/tables/staffs-table";
import { RowAction } from "@/src/components/tables/types";
import { Button } from "@/src/components/ui/button";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { deleteStaff, getStaffs } from "@/src/data/staff";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import { UsersIcon } from "@heroicons/react/24/outline";
import { Row } from "@tanstack/react-table";
import _ from "lodash";
import { PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";

export default function Staffs() {
  const { currentBusiness } = useCurrentBusinessContext();
  const { data: staffs, isLoading } = useSupaQuery(getStaffs, {
    arg: currentBusiness?.id,
    queryKey: ["getStaffs", currentBusiness?.id],
  });
  const { mutate: _deleteStaff, isPending: isDeleteStaffPending } =
    useSupaMutation(deleteStaff, {
      invalidate: [["getStaffs", currentBusiness?.id]],
    });

  const [staffDialogState, setStaffDialogState] = useState<{
    isOpen: boolean;
    initFormValues?: SaveStaffFormSchemaType;
  }>({
    isOpen: false,
  });

  const onStaffRowAction = useCallback(
    (row: Row<Tables<"staffs">>, action: RowAction) => {
      switch (action) {
        case RowAction.EDIT:
          setStaffDialogState({
            isOpen: !staffDialogState.isOpen,
            initFormValues: {
              id: row.original.id,
              first_name: row.original.first_name,
              last_name: row.original.last_name,
              email: row.original.email ?? "",
              updated_at: row.original.updated_at ?? "",
              instagram_handle: row.original.instagram_handle ?? "",
            },
          });
          break;
        case RowAction.DELETE:
          if (!isDeleteStaffPending) {
            _deleteStaff(row.original.id);
          }
          break;
        default:
          console.error("Unknown row action");
      }
    },
    [],
  );

  if (isLoading) {
    return <>Loading...</>;
  }
  return (
    <>
      <SaveStaffDialog
        initFormValues={staffDialogState.initFormValues}
        isOpen={staffDialogState.isOpen}
        onClose={() =>
          setStaffDialogState({
            ...staffDialogState,
            isOpen: !staffDialogState.isOpen,
          })
        }
      />
      {_.isEmpty(staffs) ? (
        <EmptyState
          Icon={UsersIcon}
          title="No staff found"
          actionButtonText="New staff"
          onAction={() =>
            setStaffDialogState({
              isOpen: !staffDialogState.isOpen,
              initFormValues: undefined,
            })
          }
        />
      ) : (
        <>
          <div className="mt-4 max-h-[600px] overflow-scroll ">
            <StaffsTable data={staffs || []} onRowAction={onStaffRowAction} />
          </div>
          <Button
            className="float-right mt-2"
            onClick={() =>
              setStaffDialogState({
                isOpen: !staffDialogState.isOpen,
                initFormValues: undefined,
              })
            }
          >
            <PlusIcon className="mr-1 h-5 w-5" /> New staff
          </Button>
        </>
      )}
    </>
  );
}
