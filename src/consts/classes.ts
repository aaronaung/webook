export enum ClassActionType {
  Buy = "buy",
  View = "view",
}

export enum Difficulty {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}

export const DIFFICULTY_COLORS: { [key: string]: string } = {
  [Difficulty.Beginner]: "bg-green-500",
  [Difficulty.Intermediate]: "bg-yellow-500",
  [Difficulty.Advanced]: "bg-red-500",
};
