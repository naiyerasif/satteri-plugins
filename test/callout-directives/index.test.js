import { describe, it } from "node:test";
import md from "dedent";
import { markdownToHtml } from "satteri";

import { satteriCalloutDirectives } from "#plugins/index.js";
import { snapshotOptions } from "../snapshot.utils.js";

const fixtures = [
	{
		name: "note callout without any option",
		input: md`
			:::note
			> Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "commend callout without any option",
		input: md`
			:::commend
			- Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "warn callout without any option",
		input: md`
			:::warn
			1. Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "deter callout without any option",
		input: md`
			:::deter
			\`\`\`
			Some **content** with _Markdown_ \`syntax\`.
			\`\`\`
			:::
		`
	},
	{
		name: "assert callout without any option",
		input: md`
			:::assert
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "callout with custom title",
		input: md`
			:::warn{title="Be warned!"}
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "callout with markdown title",
		input: md`
			:::warn{title="**Hold** on _there_!"}
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "custom shoutout callout",
		input: md`
			:::shoutout{title="Well done!"}
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			callouts: {
				shoutout: {
					title: "Shoutout",
					hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="callout-hint-shoutout" aria-hidden="true"><path d="M4.7 6.5h.01m8.49-2.8h.01m4.29 15.6h.01m2.79-8.5h.01m-6.41-.7 2.2-.7V6.5h2.8V3.7L21 3m-6.253 10.767c1.676-.175 2.93-.38 3.739-.064 1.234.483 1.497 1.529 1.409 3.008m-9.723-7.519c.175-1.676.38-2.93.064-3.739-.483-1.234-1.529-1.497-3.008-1.409M6.5 10.4l7.1 7.1L3 21z"/></svg>`
				}
			}
		}
	},
	{
		name: "aliased callout with alias configuration",
		input: md`
			:::danger
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			aliases: {
				danger: "deter"
			}
		}
	},
	{
		name: "other callout with alias configuration",
		input: md`
			:::assert
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			aliases: {
				danger: "deter"
			}
		}
	},
	{
		name: "matching callout with custom element type",
		input: md`
			:::assert
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			callouts: {
				assert: {
					tagName: "div"
				}
			}
		}
	},
	{
		name: "unmatching callout with custom element type configuration",
		input: md`
			:::note
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			callouts: {
				assert: {
					tagName: "div"
				}
			}
		}
	},
	{
		name: "matching callout with overriden default",
		input: md`
			:::commend
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			callouts: {
				commend: {
					title: "Tip",
					hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>`
				}
			}
		}
	},
	{
		name: "unmatching callout with overriden default",
		input: md`
			:::deter
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			callouts: {
				commend: {
					title: "Tip",
					hint: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>`
				}
			}
		}
	},
	{
		name: "callout with global custom element type",
		input: md`
			:::note
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: { tagName: "section" }
	},
	{
		name: "callout with global custom element type and specific custom element type",
		input: md`
			:::assert
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			tagName: "section",
			callouts: {
				assert: {
					tagName: "div"
				}
			}
		}
	},
	{
		name: "callouts with custom element type",
		input: md`
			:::commend{is="blockquote"}
			Some **content** with _Markdown_ \`syntax\`.
			:::
			
			:::assert
			Some **content** with _Markdown_ \`syntax\`.
			:::
			
			:::note
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`,
		options: {
			tagName: "div",
			callouts: {
				note: {
					tagName: "aside"
				}
			}
		}
	},
	{
		name: "callout with custom attributes",
		input: md`
			:::note{.fancy .blob data-callout="fancy" #intrigue}
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "callout without hint",
		input: md`
			:::note{showHint="false"}
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "callout as details element",
		input: md`
			:::note{is="details"}
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	},
	{
		name: "callout as open details element",
		input: md`
			:::note{is="details" open}
			Some **content** with _Markdown_ \`syntax\`.
			:::
		`
	}
];

describe("satteri-callout-directives", () => {
	for (const { name, input, options } of fixtures) {
		it(name, async (t) => {
			const { html } = await markdownToHtml(input, {
				mdastPlugins: [satteriCalloutDirectives(options)],
				features: {
					directive: true
				}
			});

			const output = html.trim().replace(/\n/g, "");
			t.assert.snapshot(output, snapshotOptions);
		});
	}
});
