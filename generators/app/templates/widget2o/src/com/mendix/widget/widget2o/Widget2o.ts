import { createElement } from "react";

import { Awesome } from "./components/Awesome";
import "./ui/SomeStyle.less";
import "./ui/Widget2o.css";

export const Widget2o = (props: any) =>
    createElement(Awesome, {}, props);

export default Widget2o;
