import { test, suite } from "node:test";
import assert from "node:assert/strict";
import { markdownToHtml } from "satteri";
import GithubSlugger from "github-slugger";

import { satteriSlugify } from "#plugins/index.js";

function process(markdown, options) {
	const { html } = markdownToHtml(markdown, {
		hastPlugins: [satteriSlugify(options)]
	});
	return html.trim().replace(/\n/g, "");
}

const basicSlugify = (v) => v.trim().replace(/\s+/g, "-");

suite("satteri-slugify", () => {
	test("does nothing when no options are provided", () => {
		assert.equal(process("# Hello"), "<h1>Hello</h1>");
	});

	test("does nothing when slugify is not a function", () => {
		assert.equal(process("# Hello", { slugify: "not-a-function" }), "<h1>Hello</h1>");
	});

	const options = { slugify: basicSlugify };

	test("does not overwrite an existing id", () => {
		assert.match(process(`<h1 id="keep-me">Hello</h1>`, options), /id="keep-me"/);
	});

	test("only adds ids to heading elements, not other elements", () => {
		const result = process("# Title\n\nParagraph\n\n<div>Block</div>", options);
		assert.match(result, /<h1 id="[^"]+">/);
		assert.match(result, /<p>Paragraph<\/p>/);
		assert.match(result, /<div>Block<\/div>/);
	});

	test("adds ids to all heading levels h1-h6", () => {
		const result = process("# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six", options);
		for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
			assert.match(result, new RegExp(`<${tag} id="`));
		}
	});

	test("passes the heading's text content to slugify, not markup", () => {
		let received;
		process("# Hello *World*", {
			slugify: (v) => { received = v; return "id"; },
		});
		assert.equal(received, "Hello World");
	});

	test("uses each heading's own id result independently", () => {
		const result = process("# One\n## Two", { slugify: (v) => v.toLowerCase() });
		assert.match(result, /<h1 id="one">/);
		assert.match(result, /<h2 id="two">/);
	});
});

suite("satteri-slugify reset contract", () => {
	function makeCountingSlugify() {
		let seen;
		return {
			reset: () => { seen = new Map(); },
			slugify: (v) => {
				const base = v.toLowerCase();
				const count = seen.get(base) ?? 0;
				seen.set(base, count + 1);
				return count === 0 ? base : `${base}-${count}`;
			},
		};
	}

	test("calls reset before traversal begins", () => {
		let resetCalledBefore = false;
		process("# Hello", {
			reset: () => { resetCalledBefore = true; },
			slugify: (v) => {
				assert.equal(resetCalledBefore, true);
				return v;
			},
		});
	});

	test("does not call reset when it is not provided", () => {
		assert.doesNotThrow(() => process("# Hello", { slugify: basicSlugify }));
	});

	test("shares state across headings within one document", () => {
		const { reset, slugify } = makeCountingSlugify();
		const result = process("# Intro\n## Intro", { reset, slugify });
		assert.equal(result, `<h1 id="intro">Intro</h1><h2 id="intro-1">Intro</h2>`);
	});

	test("does not carry state over between separate documents", () => {
		const { reset, slugify } = makeCountingSlugify();
		const options = { reset, slugify };

		const first = process("# Intro\n## Intro", options);
		const second = process("# Intro", options);

		assert.match(first, /id="intro-1"/);
		assert.match(second, /id="intro"/);
	});
});

suite("satteri-slugify integration with a real slugify library", () => {
	const slugger = new GithubSlugger();
	const options = {
		slugify: (v) => slugger.slug(v),
		reset: () => slugger.reset(),
	};

	test("end-to-end: heading text in, id attribute out", () => {
		assert.equal(
			process("# Hello World", options),
			`<h1 id="hello-world">Hello World</h1>`
		);
	});
});
