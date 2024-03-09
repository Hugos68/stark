import { promises as fs } from 'fs';
import * as v from 'valibot';
import { ConfigSchema } from '../utility/config.js';

export async function init() {
	if ((await fs.readdir('.')).length > 0) {
		throw new Error('Error initializing project: Current directory is not empty');
	}

	const config: v.Input<typeof ConfigSchema> = {
		name: 'My Site',
		description: 'My site description',
	};
	await fs.writeFile('stascii.config.json', JSON.stringify(config, null, 2));
	await fs.mkdir('pages');
	await fs.writeFile(
		'pages/index.adoc',
		`:title: Welcome\n\n= Welcome to My Site\n\nYou can edit this file to get started!\n\nIf you have any questions, https://github.com/Hugos68/stascii[check the documentation on GitHub.]`,
	);
}
