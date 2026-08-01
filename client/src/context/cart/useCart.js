import { useContext } from "react";

//Context
import CartContext from "./CartContext.jsx";

export default function useCart() {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
