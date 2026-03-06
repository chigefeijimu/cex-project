import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { SpotTrading } from "./pages/SpotTrading";
import { Markets } from "./pages/Markets";
import { Wallet } from "./pages/Wallet";
import { BuyCrypto } from "./pages/BuyCrypto";
import { Derivatives } from "./pages/Derivatives";
import { Earn } from "./pages/Earn";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Markets },
      { path: "trade", Component: SpotTrading },
      { path: "wallet", Component: Wallet },
      { path: "buy", Component: BuyCrypto },
      { path: "derivatives", Component: Derivatives },
      { path: "earn", Component: Earn },
      { path: "admin", Component: Admin },
    ],
  },
]);
