"use client";

import { PropsWithChildren } from "react";
import { AuthContextProvider } from "../contexts/auth";

export default function AuthProvider({ children }: PropsWithChildren) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
