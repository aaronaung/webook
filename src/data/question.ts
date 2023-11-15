import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";
import { throwIfError } from "./util";

export const saveQuestion = async (
  question: Partial<Tables<"questions">>,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client
      .from("questions")
      .upsert({ ...(question as Tables<"questions">) })
      .select(),
  );
};

export const deleteQuestion = async (
  questionId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(client.from("questions").delete().eq("id", questionId));
};

export const getQuestions = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client.from("questions").select().eq("business_id", businessId),
  );
};

export const getServicesByQuestionId = async (
  questionId: string,
  { client }: SupabaseOptions,
) => {
  return throwIfError(
    client
      .from("services")
      .select("*, service_categories(*), question (*)")
      .eq("question_id", questionId),
  );
};
