"use client";

import { SaveQuestionDialog } from "@/src/components/dialogs/save-question-dialog";
import { SaveQuestionFormSchemaType } from "@/src/components/forms/save-question-form";
import EmptyState from "@/src/components/pages/shared/empty-state";
import QuestionsTable from "@/src/components/tables/questions-table";
import { RowAction } from "@/src/components/tables/types";
import { Button } from "@/src/components/ui/button";
import { useCurrentBusinessContext } from "@/src/contexts/current-business";
import { useDeleteQuestion } from "@/src/hooks/use-delete-question";
import { useQuestions } from "@/src/hooks/use-questions";
import { Tables } from "@/types/db.extension";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Row } from "@tanstack/react-table";
import { useCallback, useState } from "react";

export default function Questions() {
  const { currentBusiness } = useCurrentBusinessContext();
  const { data: questions, isLoading } = useQuestions(currentBusiness.id);

  const { mutate: deleteQuestion, isPending: isDeleteQPending } =
    useDeleteQuestion(currentBusiness.id);
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
              type: String(row.original.type), // rhf doesn't like numbers - we can't use valueAsNumber with Controllers today.
              required: row.original.required ?? false,
            },
          });
          break;
        case RowAction.DELETE:
          if (!isDeleteQPending) {
            deleteQuestion(row.original.id);
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
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Set up questions to ask your users before they book a service. Questions
        can be attached to one or more services. Go to{" "}
        <a href="/app/business/services" className="text-primary underline">
          Services
        </a>{" "}
        to start adding questions to your services.
      </p>
      {questions.length === 0 ? (
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
          <QuestionsTable data={questions} onRowAction={onRowAction} />
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
