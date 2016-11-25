import { shallow } from "enzyme"; // enzyme's api doesn't provide innerHTML for svg. use "React.addons.TestUtils"
import { DOM, createElement } from "react";

import { Awesome } from "../Awesome";

describe("TimeSeries", () => {
    const render = (props: any ) => shallow(createElement(Awesome, props));

    it("should render widget structure", () => {
        const renderAwesome = render({ message: "Hello world!" });

        expect(renderAwesome).toMatchStructure(
            DOM.p({ className: "mx-awesome" })
        );
    });

    it("should render empty message without props", () => {
        const renderAwesome = render({});
        const text = renderAwesome.text();
        expect(text).toBe("It is so empty!");
    });
});
