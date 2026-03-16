import { mount } from "moonie";
import "./style.css";
import { routes } from "./router";

mount("#app")?.router(routes);
