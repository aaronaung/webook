import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwOrData } from "./util";

export const saveQuestion = async (
  {
    question,
    serviceIds,
  }: {
    question: Partial<Tables<"questions">>;
    serviceIds?: {
      added: string[];
      removed: string[];
    };
  },
  { client }: SupabaseOptions,
) => {
  const upsertedQuestion = await throwOrData(
    client
      .from("questions")
      .upsert({ ...(question as Tables<"questions">) })
      .select("id")
      .limit(1)
      .single(),
  );

  if (serviceIds) {
    await saveQuestionServices(upsertedQuestion.id, serviceIds, { client });
  }
  return upsertedQuestion;
};

// This will delete all service questions for the given service id, and then upsert the new ones.
export const saveQuestionServices = async (
  questionId: string,
  serviceIds: {
    added: string[];
    removed: string[];
  },
  { client }: SupabaseOptions,
) => {
  if (serviceIds.removed.length > 0) {
    await throwOrData(
      client
        .from("services_questions")
        .delete()
        .eq("question_id", questionId)
        .in("service_id", serviceIds.removed),
    );
  }

  if (serviceIds.added.length > 0) {
    await throwOrData(
      client.from("services_questions").upsert(
        serviceIds.added.map((serviceId) => ({
          question_id: questionId,
          service_id: serviceId,
        })),
      ),
    );
  }
  return;
};

export const deleteQuestion = async (
  questionId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(client.from("questions").delete().eq("id", questionId));
};

export const getQuestions = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("questions")
      .select()
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
  );
};

export const getServicesByQuestionId = async (
  questionId: string,
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("services")
      .select("*, question (*)")
      .eq("question_id", questionId),
  );
};

export const saveQuestionAnswers = async (
  questionAnswers: Partial<Tables<"question_answers">>[],
  { client }: SupabaseOptions,
) => {
  return throwOrData(
    client
      .from("question_answers")
      .upsert(questionAnswers as Tables<"question_answers">[]),
  );
};
