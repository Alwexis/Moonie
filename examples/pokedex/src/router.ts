import { type Route } from "moonie";
import Home from "./views/Home.mn";
import Pokemon from "./views/Pokemon.mn";

export const routes: Route[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/pokemon/:id",
    component: Pokemon,
  },
];
