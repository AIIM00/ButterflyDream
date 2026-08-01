import { createContext, useContext } from "react";

const AppContext = createContext(null);

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === null) {
    throw new Error(
      "useAppContext must be used inside an AppProvider component.",
    );
  }

  return context;
}

export default AppContext;
