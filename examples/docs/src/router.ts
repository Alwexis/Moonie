import { type Route } from "moonie/router";
import Home from "./views/Home.mn";
import GettingStarted from "./views/GettingStarted.mn";

export const routes: Route[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/docs/getting-started",
    component: GettingStarted,
  },
];
