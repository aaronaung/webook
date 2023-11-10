import { Tables } from "@/types/db.extension";
import { SupabaseOptions } from "./types";

export const saveQuestion = async (
  question: Partial<Tables<"question">>,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("question")
    .upsert({ ...(question as Tables<"question">) })
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
  const { error } = await client.from("question").delete().eq("id", questionId);
  if (error) {
    throw error;
  }
};

export const getQuestions = async (
  businessId: string,
  { client }: SupabaseOptions,
) => {
  const { data, error } = await client
    .from("question")
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
    .from("service")
    .select("*, service_group(*), question (*)")
    .eq("question_id", questionId);
  if (error) {
    throw error;
  }
  return data;
};

export const getQuestionsByServiceId = async (
  serviceId: string,
  { client }: SupabaseOptions,
) => {};
