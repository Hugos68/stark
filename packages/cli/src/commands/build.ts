import { getConfig } from '../utility/config.js';
import { existsSync, promises as fs } from 'fs';
import { join, basename } from 'path';
import asciidoctor, { Asciidoctor } from 'asciidoctor';
import * as v from 'valibot';
import { generateDocument } from '../utility/template.js';
import { cancel, spinner } from '@clack/prompts';

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
	const config = await getConfig();
	const pages = await getPages(config.pagesDir);

	if (pages.length === 0) {
		cancel(`Operation cancelled: No pages found in: "${config.pagesDir}"`);
		process.exit(0);
	}

	// Grab template from Github

	// Convert each page to HTML
	// @ts-expect-error
	const ascii = asciidoctor() as Asciidoctor;
	const convertSpinner = spinner();
	convertSpinner.start('Converting pages to HTML...');
	const documents = await Promise.all(
		pages.map(async ({ filename, path, slug }) => {
			convertSpinner.message(`Converting "${path ? join(path, filename) : filename}"`);
			try {
				const document = ascii.loadFile(join(config.pagesDir, path, filename));
				const attributes = v.parse(AttributesSchema, document.getAttributes());
				const head = `
				<title>${attributes.title} - ${config.name}</title>
				<meta name="description" content="${attributes.title}" />
				`;
				const body = document.convert();
				convertSpinner.message(`Converted "${path ? join(path, filename) : filename}"`);
				return {
					content: await generateDocument(head, body),
					path,
					slug,
				};
			} catch {
				cancel(
					`Operation cancelled: Unable to parse "${path ? join(path, filename) : filename}", make sure the file is valid AsciiDoc and the required attributes are present.`,
				);
				process.exit(1);
			}
		}),
	);
	convertSpinner.stop('Converted all pages to HTML');

	// Create output directory if it doesn't exist
	if (!existsSync(config.outDir)) {
		await fs.mkdir(config.outDir, {
			recursive: true,
		});
	}

	// Write HTML files to output directory
	const writeSpinner = spinner();
	writeSpinner.start('Writing HTML files...');
	await Promise.all(
		documents.map(async ({ path, slug, content }) => {
			const outDir = join(config.outDir, path);
			const filename = `${slug}.html`;
			writeSpinner.message(`Writing "${join(outDir, filename)}"`);
			try {
				if (!existsSync(outDir)) {
					await fs.mkdir(outDir, {
						recursive: true,
					});
				}
				await fs.writeFile(join(outDir, filename), content);
			} catch {
				cancel(`Operation cancelled: Unable to write to "${join(config.outDir, path)}"`);
				process.exit(1);
			}
			writeSpinner.message(`Wrote "${join(outDir, filename)}"`);
		}),
	);
	writeSpinner.stop(`Wrote all pages to "${config.outDir}"`);
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
