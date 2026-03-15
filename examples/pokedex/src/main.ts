import { h, mount, RouterView } from "moonie";
import "./style.css";
import { routes } from "./router";

function App() {
  return h(RouterView, {
    routes,
  });
}

mount("#app", App);
