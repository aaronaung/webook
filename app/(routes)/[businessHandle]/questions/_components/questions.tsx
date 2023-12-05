"use client";
import HeaderWithAction from "@/src/components/shared/header-with-action";
import { Button } from "@/src/components/ui/button";
import InputTextArea from "@/src/components/ui/input/textarea";
import { Label } from "@/src/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { toast } from "@/src/components/ui/use-toast";
import { BOOKING_STATUS_PENDING } from "@/src/consts/booking";
import {
  QUESTION_TYPE_BOOLEAN,
  QUESTION_TYPE_TEXT,
} from "@/src/consts/questions";
import { useCurrentViewingBusinessContext } from "@/src/contexts/current-viewing-business";
import { saveBooking } from "@/src/data/booking";
import { createBookingChatRoom, saveChatMessage } from "@/src/data/chat";
import { saveQuestionAnswers } from "@/src/data/question";
import { GetServiceResponse } from "@/src/data/service";
import { BookingRequest } from "@/src/hooks/use-booking";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { Tables } from "@/types/db.extension";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Questions({
  service,
  bookingRequest,
  loggedInUser,
}: {
  service: GetServiceResponse;
  bookingRequest: BookingRequest;
  loggedInUser: Tables<"users">;
}) {
  const { currentViewingBusiness } = useCurrentViewingBusinessContext();
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  const isRequiredQuestionAnswered = (q: Tables<"questions">) => {
    return q.required && answers[q.id] !== undefined && answers[q.id] !== "";
  };

  const { mutateAsync: _saveBooking } = useSupaMutation(saveBooking);
  const { mutateAsync: _saveQandA } = useSupaMutation(saveQuestionAnswers);
  const { mutateAsync: _saveChatMessage } = useSupaMutation(saveChatMessage);
  const { mutateAsync: _createBookingChatRoom } = useSupaMutation(
    createBookingChatRoom,
  );

  const prettifyAnswers = () => {
    let prettifiedAnswers = "";
    for (const [qId, ans] of Object.entries(answers)) {
      const q = (service.questions || []).find(
        (q: Tables<"questions">) => q.id === qId,
      );
      if (q) {
        if (q.type === QUESTION_TYPE_BOOLEAN) {
          prettifiedAnswers += `${q.question}:\n ${ans ? "Yes" : "No"}\n`;
        } else {
          prettifiedAnswers += `${q.question}:\n ${ans}\n`;
        }
      }
    }
    return prettifiedAnswers;
  };

  const handleContinue = async () => {
    for (const q of service.questions || []) {
      if (q.required && !isRequiredQuestionAnswered(q)) {
        return;
      }
    }

    try {
      setIsProcessingBooking(true);
      // todo (VERY IMPORTANT) - consider wrapping all of this in a postgres function for atomicity.
      // For availability based booking, check if there's conflict with other ACCEPTED bookings. Note: we may want to let the user book even if there's
      // conflict with other NON-ACCEPTED bookings.
      const room = await _createBookingChatRoom({
        name:
          `${service.title} - ${format(
            new Date(bookingRequest.start),
            "MM/dd/yyyy h:mm a",
          )}` || "",
        bookerId: loggedInUser.id,
        businessId: currentViewingBusiness.id,
      });

      await _saveChatMessage({
        room_id: room.id,
        sender_user_id: loggedInUser.id,
        content: prettifyAnswers(),
      });

      const booking = await _saveBooking({
        booker_id: loggedInUser.id,
        business_id: currentViewingBusiness.id,
        status: BOOKING_STATUS_PENDING,
        chat_room_id: room.id,
        ...bookingRequest,
      });

      const questionAnswers: Partial<Tables<"question_answers">>[] = (
        service?.questions || []
      ).map((q: Tables<"questions">) => ({
        booking_id: booking.id,
        question_id: q.id,
        bool_answer: q.type === QUESTION_TYPE_BOOLEAN ? answers[q.id] : null,
        text_answer: q.type === QUESTION_TYPE_TEXT ? answers[q.id] : null,
      }));
      await _saveQandA(questionAnswers);
      router.replace(
        `/${currentViewingBusiness.handle}/chat?room_id=${room.id}`,
      );
    } catch (err) {
      toast({
        title: "It's on us",
        description: "An error occurred. Please reload and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingBooking(false);
    }
  };

  const renderQuestion = (q: Tables<"questions">) => {
    let answerBox = <></>;
    switch (q.type) {
      case QUESTION_TYPE_TEXT:
        answerBox = (
          <InputTextArea
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
            }
            value={answers[q.id] ?? ""}
            textareaProps={{
              placeholder: "Type your answer here...",
              rows: 4,
            }}
          />
        );
        break;
      case QUESTION_TYPE_BOOLEAN:
        answerBox = (
          <RadioGroup
            onValueChange={(value) =>
              setAnswers((prev) => ({ ...prev, [q.id]: value === "true" }))
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={"true"} id="option-yes" />
              <Label htmlFor="option-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={"false"} id="option-no" />
              <Label htmlFor="option-no">No</Label>
            </div>
          </RadioGroup>
        );
        break;
      default:
        answerBox = <></>;
    }
    return (
      <div key={q.id}>
        <p className="mb-2 text-sm">{q.question}</p>
        {answerBox}
        {q.required && !isRequiredQuestionAnswered(q) && (
          <p className="mt-2 text-sm text-destructive">
            You must answer this question before proceeding.
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <HeaderWithAction
        title="Almost there"
        leftActionBtn={
          <Button
            onClick={() => {
              router.back();
            }}
            variant="ghost"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        }
      />
      <div className="relative">
        <div className="flex flex-col gap-5 p-6 lg:p-10">
          <p className="text-sm text-muted-foreground">
            Please answer the following questions before booking &quot;
            {service.title}&quot;.
          </p>
          {(service?.questions || []).map((q) => (
            <div className="" key={q.id}>
              {renderQuestion(q)}
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 w-full border-t-2  bg-secondary">
          <Button
            className="float-right m-4"
            onClick={handleContinue}
            disabled={
              isProcessingBooking ||
              (service.questions || [])
                .map(
                  (q: Tables<"questions">) =>
                    q.required && !isRequiredQuestionAnswered(q),
                )
                .includes(true)
            }
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
