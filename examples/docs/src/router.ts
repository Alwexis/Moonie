import { type Route } from "moonie/router";
import Home from "./views/Home.mn";
import GettingStarted from "./views/GettingStarted.mn";
import Reactivity from "./views/Reactivity.mn";
import Components from "./views/Components.mn";
import Templates from "./views/Templates.mn";
import Router from "./views/Router.mn";
import APIReference from "./views/APIReference.mn";

export const routes: Route[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/docs/getting-started",
    component: GettingStarted,
  },
  {
    path: "/docs/reactivity",
    component: Reactivity,
  },
  {
    path: "/docs/components",
    component: Components,
  },
  {
    path: "/docs/templates",
    component: Templates,
  },
  {
    path: "/docs/router",
    component: Router,
  },
  {
    path: "/docs/api",
    component: APIReference,
  },
];
