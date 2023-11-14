import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";

export const saveQuestion = async (
  question: Partial<Tables<"questions">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("questions")
    .upsert({ ...(question as Tables<"questions">) })
    .select();
  if (error) {
    throw error;
  }
  return data;
};

export const deleteQuestion = async (
  questionId: string,
  { client }: SupabaseOptions,
) => {
  const { error } = await client
    .from("questions")
    .delete()
    .eq("id", questionId);
  if (error) {
    throw error;
  }
};

export const getQuestions = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("questions")
    .select()
    .eq("business_id", businessId);
  if (error) {
    throw error;
  }
  return data;
};

export const getServicesByQuestionId = async (
  questionId: string,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("services")
    .select("*, service_categories(*), question (*)")
    .eq("question_id", questionId);
  if (error) {
    throw error;
  }
  return data;
};
