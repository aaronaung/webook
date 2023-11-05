import { Tables } from "@/types/db.extension";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

type CurrentBusinessContextValue = {
  currentBusiness: Tables<"business">;
  setCurrentBusiness: Dispatch<SetStateAction<Tables<"business">>>;
};

const CurrentBusinessContext =
  createContext<CurrentBusinessContextValue | null>(null);
function useCurrentBusinessContext() {
  const context = useContext(CurrentBusinessContext);
  if (!context) {
    throw new Error(
      `useCurrentBusinessContext must be used within a CurrentBusinessProvider`,
    );
  }
  return context;
}

function CurrentBusinessProvider(props: {
  initialBusinesses: Tables<"business">[];
  children: React.ReactNode;
}) {
  const [currentBusiness, setCurrentBusiness] = useState(
    props.initialBusinesses?.[0],
  );
  const value = {
    currentBusiness: currentBusiness || props.initialBusinesses?.[0],
    setCurrentBusiness,
  };

  return <CurrentBusinessContext.Provider value={value} {...props} />;
}

export { CurrentBusinessProvider, useCurrentBusinessContext };
export default CurrentBusinessContext;
