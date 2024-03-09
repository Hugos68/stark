import { getConfig } from '../utility/config.js';
import { promises as fs } from 'fs';
import { join, basename } from 'path';
import asciidoctor, { Asciidoctor } from 'asciidoctor';
import * as v from 'valibot';
import { generateDocument } from '../utility/template.js';
import { intro } from '@clack/prompts';

const PageSchema = v.object({
	filename: v.string(),
	slug: v.string(),
	path: v.string(),
});

type Page = v.Output<typeof PageSchema>;

const AttributesSchema = v.object({
	title: v.string(),
});

export async function build() {
	intro('Building site');
	const config = await getConfig();
	const pages = await getPages(config.pagesDir);

	if (pages.length === 0) {
		throw new Error(`No pages found in: "${config.pagesDir}"`);
	}

	// @ts-expect-error
	const ascii = asciidoctor() as Asciidoctor;

	// Convert each page to HTML
	const documents = await Promise.all(
		pages.map(async ({ filename, path, slug }) => {
			const document = ascii.loadFile(join(config.pagesDir, path, filename));
			const attributes = v.parse(AttributesSchema, document.getAttributes());
			const head = `
				<title>${attributes.title} - ${config.name}</title>
				<meta name="description" content="${attributes.title}" />
				`;
			const body = document.convert();
			return {
				content: await generateDocument(head, body),
				path,
				slug,
			};
		}),
	);

	// Create output directory if it doesn't exist
	try {
		await fs.access(config.outDir);
	} catch (err) {
		await fs.mkdir(config.outDir, {
			recursive: true,
		});
	}

	// Write HTML files to output directory
	await Promise.all(
		documents.map(async (document) => {
			const outDir = join(config.outDir, document.path);
			const filename = `${document.slug}.html`;
			try {
				await fs.access(outDir);
			} catch {
				await fs.mkdir(outDir, {
					recursive: true,
				});
			}
			await fs.writeFile(join(outDir, filename), document.content);
		}),
	);
}

async function getPages(directory: string) {
	const pages: Page[] = [];

	const entries = await fs.readdir(directory, {
		withFileTypes: true,
		recursive: true,
	});

	const files = entries.filter((entry) => entry.isFile());

	for (const file of files) {
		const filename = file.name;
		const slug = basename(file.name, '.adoc');
		/**
		 * @example "pages" -> ""
		 * @example "pages/foo" -> "foo"
		 * @example "pages/foo/bar" -> "foo/bar"
		 */
		const path = file.path.replace(/^(.*?)pages(\\|\/)?/, '');
		const page = v.parse(PageSchema, { filename, slug, path });
		pages.push(page);
	}

	return pages;
}
