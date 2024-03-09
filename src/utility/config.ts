import { promises as fs } from 'fs';
import * as v from 'valibot';

export const ConfigSchema = v.transform(
	v.object({
		name: v.string(),
		description: v.string(),
		pagesDir: v.optional(v.string()),
		outDir: v.optional(v.string()),
	}),
	(input) => {
		return {
			pagesDir: 'pages',
			outDir: 'dist',
			...input,
		};
	},
);

export async function getConfig() {
	const rawConfig = await fs.readFile('stascii.config.json', 'utf-8');
	const config = JSON.parse(rawConfig);
	return v.parse(ConfigSchema, config);
}
