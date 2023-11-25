import { Tables } from "@/types/db.extension";
import { createContext, useContext } from "react";
import { useLocalStorage } from "usehooks-ts";

type CurrentBusinessContextValue = {
  currentBusiness: Tables<"businesses">;
  setCurrentBusiness: (newHandle: string) => void;
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

function CurrentBusinessProvider({
  initialBusinesses,
  ...props
}: {
  initialBusinesses: Tables<"businesses">[];
  children: React.ReactNode;
}) {
  const [businessHandle, setBusinessHandle] = useLocalStorage(
    "current_business",
    initialBusinesses[0].handle,
  );

  const setCurrentBusiness = (newHandle: string) => {
    setBusinessHandle(newHandle);
  };

  const value = {
    currentBusiness:
      initialBusinesses.find((b) => b.handle === businessHandle) ||
      initialBusinesses?.[0],
    setCurrentBusiness,
  };

  return <CurrentBusinessContext.Provider value={value} {...props} />;
}

export { CurrentBusinessProvider, useCurrentBusinessContext };
export default CurrentBusinessContext;
