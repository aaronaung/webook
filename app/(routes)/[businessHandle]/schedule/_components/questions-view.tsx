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
import { saveBooking } from "@/src/data/booking";
import {
  saveChatMessage,
  saveChatRoom,
  saveChatRoomParticipants,
} from "@/src/data/chat";
import { saveQuestionAnswers } from "@/src/data/question";
import { useSupaMutation } from "@/src/hooks/use-supabase";
import { ServiceEvent } from "@/types";
import { Tables } from "@/types/db.extension";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ServiceEventQuestionsProps = {
  user?: User;
  event: ServiceEvent;
  businessHandle: string;
  businessId?: string;
  onBack: () => void;
};
export default function ServiceEventQuestions({
  user,
  event,
  businessHandle,
  businessId,
  onBack,
}: ServiceEventQuestionsProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});

  const isRequiredQuestionAnswered = (q: Tables<"questions">) =>
    q.required && answers[q.id] !== undefined && answers[q.id] !== "";

  const { mutateAsync: _saveBooking } = useSupaMutation(saveBooking);
  const { mutateAsync: _saveQandA } = useSupaMutation(saveQuestionAnswers);
  const { mutateAsync: _saveChatRoom } = useSupaMutation(saveChatRoom);
  const { mutateAsync: _saveChatMessage } = useSupaMutation(saveChatMessage);
  const { mutateAsync: _saveChatRoomParticipants } = useSupaMutation(
    saveChatRoomParticipants,
  );

  const prettifyAnswers = () => {
    let prettifiedAnswers = "";
    for (const [qId, ans] of Object.entries(answers)) {
      const q = event.service.questions.find((q) => q.id === qId);
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
    if (!user || !businessId) {
      toast({
        title: "Something went wrong",
        description: "It's us, not you. Please reload and try again.",
        variant: "destructive",
      });
      return;
    }
    for (const q of event.service.questions) {
      if (!isRequiredQuestionAnswered(q)) {
        return;
      }
    }

    // todo - consider wrapping all of this in a postgres function for atomicity.
    const booking = await _saveBooking({
      booker_id: user?.id,
      service_event_id: event.id,
      status: BOOKING_STATUS_PENDING,
    });

    const questionAnswers: Partial<Tables<"question_answers">>[] =
      event.service.questions.map((q) => ({
        booking_id: booking.id,
        question_id: q.id,
        bool_answer: q.type === QUESTION_TYPE_BOOLEAN ? answers[q.id] : null,
        text_answer: q.type === QUESTION_TYPE_TEXT ? answers[q.id] : null,
      }));
    await _saveQandA(questionAnswers);

    const chatRoom = await _saveChatRoom({
      name: `${businessHandle} <> ${user?.email}`,
    });
    await _saveChatRoomParticipants({
      chatRoomId: chatRoom.id,
      participants: [user.id],
      businessId,
    });
    await _saveChatMessage({
      booking_id: booking.id,
      room_id: chatRoom.id,
      sender_user_id: user.id,
      content: prettifyAnswers(),
    });

    router.replace(`/${businessHandle}/chat/${chatRoom.id}`);
    /**
     * booking_id <- create a pending booking.
     * save answers to db.
     * create a chat room between the business and the logged in user as participants.
     * create a chat message in the chat room with the answers to the questions with the booking_id.
     * redirect user to the chat room.
     * */
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
      <>
        <p className="mb-2 text-sm">{q.question}</p>
        {answerBox}
        {!isRequiredQuestionAnswered(q) && (
          <p className="mt-2 text-sm text-destructive">
            You must answer this question before proceeding.
          </p>
        )}
      </>
    );
  };

  return (
    <div>
      <HeaderWithAction
        title="Almost there"
        leftActionBtn={
          <Button onClick={onBack} variant="ghost">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        }
      />
      <div className="relative">
        <div className="flex flex-col gap-5 p-6 lg:p-10">
          <p className="text-sm text-muted-foreground">
            Please answer the following questions before booking &quot;
            {event.service.title}&quot;.
          </p>
          {(event.service.questions || []).map((q) => (
            <div className="" key={q.id}>
              {renderQuestion(q)}
            </div>
          ))}
        </div>
        <div className="fixed bottom-0 w-full border-t-2  bg-secondary">
          <Button
            className="float-right m-4"
            onClick={handleContinue}
            disabled={(event.service.questions || [])
              .map((q) => isRequiredQuestionAnswered(q))
              .includes(false)}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
