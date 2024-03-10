const HEAD_SYMBOL = '%stascii.head%';
const BODY_SYMBOL = '%stascii.body%';

import { promises as fs } from 'fs';
import { join } from 'path';

export async function generateDocument(head: string, body: string) {
	const template = await fs.readFile(join('..', '..', 'template', 'index.html'), 'utf-8');
	const document = template.replace(HEAD_SYMBOL, head).replace(BODY_SYMBOL, body);
	return document;
}
