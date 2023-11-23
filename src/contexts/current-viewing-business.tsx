"use client";
import { Tables } from "@/types/db.extension";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

type CurrentViewingBusinessContextValue = {
  currentViewingBusiness: Tables<"businesses">;
  setCurrentViewingBusiness: Dispatch<SetStateAction<Tables<"businesses">>>;
};

const CurrentViewingBusinessContext =
  createContext<CurrentViewingBusinessContextValue | null>(null);
function useCurrentViewingBusinessContext() {
  const context = useContext(CurrentViewingBusinessContext);
  if (!context) {
    throw new Error(
      `useCurrentViewingBusinessContext must be used within a CurrentViewingBusinessProvider`,
    );
  }
  return context;
}

function CurrentViewingBusinessProvider(props: {
  initialBusiness: Tables<"businesses">;
  children: React.ReactNode;
}) {
  const [currentViewingBusiness, setCurrentViewingBusiness] = useState<
    Tables<"businesses">
  >(props.initialBusiness);
  const value = {
    currentViewingBusiness,
    setCurrentViewingBusiness,
  };

  return <CurrentViewingBusinessContext.Provider value={value} {...props} />;
}

export { CurrentViewingBusinessProvider, useCurrentViewingBusinessContext };
export default CurrentViewingBusinessContext;
