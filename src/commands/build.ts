import { getConfig } from '../utility/config.js';
import { promises as fs } from 'fs';
import { join, basename, relative } from 'path';
import asciidoctor, { Asciidoctor } from 'asciidoctor';
import * as v from 'valibot';
import { generateDocument } from '../utility/template.js';

const PageSchema = v.object({
	slug: v.string(),
	path: v.string(),
});

type Page = v.Output<typeof PageSchema>;

const AttributesSchema = v.object({
	title: v.string(),
});

export async function build() {
	const config = await getConfig();
	const pages = await getPages(config.pagesDir);

	if (pages.length === 0) {
		throw new Error(`No pages found in: "${config.pagesDir}"`);
	}

	// @ts-expect-error
	const ascii = asciidoctor() as Asciidoctor;

	// Convert each page to HTML
	const documents = await Promise.all(
		pages.map(async ({ path, slug }) => {
			const document = ascii.loadFile(path);
			const attributes = v.parse(AttributesSchema, document.getAttributes());
			return {
				content: await generateDocument(
					`<title>${attributes.title}</title>`,
					document.convert(),
				),
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
			const outputPath = join(config.outDir, document.slug + '.html');
			await fs.writeFile(outputPath, document.content);
		}),
	);
}

async function getPages(directory: string) {
	const pages: Page[] = [];

	try {
		const entries = await fs.readdir(directory, {
			withFileTypes: true,
		});

		for (const entry of entries) {
			const itemPath = join(directory, entry.name);

			if (entry.isFile()) {
				if (entry.name.endsWith('.adoc')) {
					const slug = basename(itemPath, '.adoc');
					const relativePath = relative(process.cwd(), itemPath);
					const page = v.parse(PageSchema, {
						slug,
						path: relativePath,
					});
					pages.push(page);
				}
			} else if (entry.isDirectory()) {
				pages.push(...(await getPages(itemPath)));
			}
		}
	} catch (err) {
		console.error('Error reading directory:', err);
	}
	return pages;
}
