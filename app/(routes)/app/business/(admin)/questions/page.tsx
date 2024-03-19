"use client";

import { SaveQuestionDialog } from "@/src/components/dialogs/save-question-dialog";
import { SaveQuestionFormSchemaType } from "@/src/components/forms/save-question-form";
import EmptyState from "@/src/components/common/empty-state";
import QuestionsTable from "@/src/components/tables/questions-table";
import { RowAction } from "@/src/components/tables/types";
import { Button } from "@/src/components/ui/button";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { deleteQuestion, getQuestions } from "@/src/data/question";
import { getServices } from "@/src/data/service";
import { useSupaMutation, useSupaQuery } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Row } from "@tanstack/react-table";
import { useCallback, useState } from "react";

export default function Questions() {
  const { currentBusiness } = useCurrentBusinessContext();
  const { data: questions, isLoading: isLoadingQuestions } = useSupaQuery(
    getQuestions,
    currentBusiness.id,
    { queryKey: ["getQuestions", currentBusiness.id] },
  );

  const { data: services, isLoading: isLoadingServices } = useSupaQuery(
    getServices,
    currentBusiness.id,
    {
      queryKey: ["getServices", currentBusiness.id],
    },
  );

  const { mutate: _deleteQuestion, isPending: deleting } = useSupaMutation(
    deleteQuestion,
    {
      invalidate: [
        ["getQuestions", currentBusiness.id],
        ["getServices", currentBusiness.id],
      ],
    },
  );

  const [qDialogState, setQDialogState] = useState<{
    isOpen: boolean;
    initFormValues?: SaveQuestionFormSchemaType;
  }>({
    isOpen: false,
  });

  const onRowAction = useCallback(
    (row: Row<Tables<"questions">>, action: RowAction) => {
      switch (action) {
        case RowAction.EDIT:
          setQDialogState({
            isOpen: !qDialogState.isOpen,
            initFormValues: {
              id: row.original.id,
              question: row.original.question,
              type: row.original.type,
              required: row.original.required ?? false,
              service_ids: (services || [])
                .filter((s) =>
                  s.questions.some((q) => q.id === row.original.id),
                )
                .map((s) => s.id),
            },
          });
          break;
        case RowAction.DELETE:
          if (!deleting) {
            _deleteQuestion(row.original.id);
          }
          break;
        default:
          console.error("Unknown row action");
      }
    },
    [_deleteQuestion, deleting, qDialogState.isOpen, services],
  );

  if (isLoadingQuestions || isLoadingServices) {
    return <>Loading...</>;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Set up questions to ask your users before they book a service. Questions
        can be attached to one or more services.
      </p>
      {(questions || []).length === 0 ? (
        <EmptyState
          title="No questions"
          description="Create one to get started."
          actionButtonText="New question"
          Icon={QuestionMarkCircleIcon}
          onAction={() => {
            setQDialogState({
              isOpen: true,
            });
          }}
        />
      ) : (
        <div>
          <QuestionsTable data={questions || []} onRowAction={onRowAction} />
          <Button
            className="float-right mt-2"
            onClick={() => {
              setQDialogState({
                isOpen: true,
              });
            }}
          >
            New Question
          </Button>
        </div>
      )}
      <SaveQuestionDialog
        availableServices={services || []}
        isOpen={qDialogState.isOpen}
        initFormValues={qDialogState.initFormValues}
        onClose={() => {
          setQDialogState({
            isOpen: false,
          });
        }}
      />
    </div>
  );
}
