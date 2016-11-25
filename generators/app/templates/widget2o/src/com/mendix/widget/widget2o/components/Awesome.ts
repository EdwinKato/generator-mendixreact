import { createElement } from "react";

import "./Awesome.css";

export const Awesome = (props: any) => {
    const hasProps = !(Object.keys(props).length === 0 && props.constructor === Object);
    return createElement("p", { className: "mx-awesome" }, hasProps ? JSON.stringify(props) : "It is so empty!");
};

export default Awesome;
