import { useContext } from "react";
import AppContext from "./AppContext.js";

function useAppContext() {
  const context = useContext(AppContext);

  if (context === null) {
    throw new Error(
      "useAppContext must be used inside an AppProvider component.",
    );
  }

  return context;
}

export default useAppContext;
