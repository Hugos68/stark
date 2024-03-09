import { promises as fs } from 'fs';
import * as v from 'valibot';

export const ConfigSchema = v.object({
	name: v.string(),
	description: v.string(),
	pagesDir: v.optional(v.string(), 'pages'),
	outDir: v.optional(v.string(), 'dist'),
});

export async function getConfig() {
	const rawConfig = await fs.readFile('stascii.config.json', 'utf-8');
	const config = JSON.parse(rawConfig);
	return v.parse(ConfigSchema, config);
}
