import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { useLocalStorage } from "usehooks-ts";

export enum AppType {
  Student = "Student",
  Instructor = "Instructor",
}

type CurrentAppContextValue = {
  currentApp: AppType;
  switchApp: (app: AppType) => void;
};

const CurrentAppContext = createContext<CurrentAppContextValue | null>(null);
function useCurrentAppContext() {
  const context = useContext(CurrentAppContext);
  if (!context) {
    throw new Error(
      `useCurrentAppContext must be used within a CurrentAppProvider`,
    );
  }
  return context;
}

function CurrentAppProvider({
  initialApp,
  ...props
}: {
  initialApp: AppType;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [app, setApp] = useLocalStorage("app", initialApp);

  const switchApp = (newApp: AppType) => {
    setApp(newApp);
    switch (app) {
      case AppType.Student:
        router.push("/app/business/classes");
        break;
      case AppType.Instructor:
        router.push("/app/student/classes");
        break;
    }
  };

  const value = {
    currentApp: app,
    switchApp,
  };

  return <CurrentAppContext.Provider value={value} {...props} />;
}

export { CurrentAppProvider, useCurrentAppContext };
export default CurrentAppContext;
