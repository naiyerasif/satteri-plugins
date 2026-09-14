import { describe, it } from "node:test";
import md from "dedent";
import { markdownToHtml } from "satteri";

import { satteriFigureDirective } from "#plugins/index.js";
import { snapshotOptions } from "../snapshot.utils.js";

const fixtures = [
	{
		name: "should render figure with caption at the end",
		input: md`
			:::figure
			![An insightful image](./image.png)
			
			::caption[This is a caption positioned below the image.]
			:::
		`
	},
	{
		name: "should render multiple paragraphs inside figcaption",
		input: md`
			::::figure
			![An insightful image](./image.png)

			:::caption
			First paragraph of a very long caption.

			Second paragraph of the same caption.
			:::
			::::
		`
	},
	{
		name: "should render figure with caption at the start",
		input: md`
			:::figure
			::caption[This is a caption positioned above the image.]
			
			![An insightful image](./image.png)
			:::
		`
	},
	{
		name: "should render nested figures with matching caption position",
		input: md`
			::::figure
			::caption[This is a caption for the outer figure.]

			:::figure
			::caption[This is a caption for the inner figure.]

			![An insightful image](./image.png)
			:::
			::::
		`
	},
	{
		name: "should forward attributes on figure and caption to hProperties",
		input: md`
			:::figure{.wide #fig-1}
			![An insightful image](./image.png)

			::caption[This is a caption with attributes.]{.small}
			:::
		`
	},
	{
		name: "should drop a figure with no caption untouched",
		input: md`
			:::figure
			> Just a blockquote, nothing else.
			:::
		`
	},
	{
		name: "should drop a figure with a single child (no caption) untouched",
		input: md`
			:::figure
			![An insightful image](./image.png)
			:::
		`
	},
	{
		name: "should drop unregistered container directives",
		input: md`
			:::note
			![An insightful image](./image.png)

			::caption[This should not become a figcaption.]
			:::
		`
	}
];

describe("satteri-figure-directive", () => {
	for (const { name, input } of fixtures) {
		it(name, async (t) => {
			const { html } = await markdownToHtml(input, {
				mdastPlugins: [satteriFigureDirective],
				features: {
					directive: true
				}
			});

			const output = html.trim().replace(/\n/g, "");
			t.assert.snapshot(output, snapshotOptions);
		});
	}
});
