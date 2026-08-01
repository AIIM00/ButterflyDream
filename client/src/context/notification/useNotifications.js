import { useContext } from "react";
import NotificationContext from "./NotificationContext.js";

export default function useNotifications() {
  const context = useContext(NotificationContext);

  if (context === null) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider.",
    );
  }

  return context;
}
