import { promises as fs } from 'fs';
import * as v from 'valibot';
import { ConfigSchema } from '../utility/config.js';
import { confirm, text, isCancel, cancel, spinner } from '@clack/prompts';

export async function init() {
	const files = await fs.readdir('.');

	if (files.length > 0) {
		const shouldContinue = await confirm({
			message:
				'Current directory is not empty, continuing will clear the current directory. Continue?',
		});
		if (!shouldContinue) {
			cancel('Operation cancelled by user');
			process.exit(0);
		}
		await Promise.all(files.map((file) => fs.rm(file, { recursive: true })));
	}

	const name = await text({ message: 'What is the name of your site?', placeholder: 'My Site' });

	if (isCancel(name)) {
		cancel('Operation cancelled by user');
		process.exit(0);
	}

	const description = await text({
		message: 'What is the description of your site?',
		placeholder: 'My site description',
	});

	if (isCancel(description)) {
		cancel('Operation cancelled by user');
		process.exit(0);
	}

	const config: v.Input<typeof ConfigSchema> = { name, description };

	const s = spinner();

	s.start('Creating stascii.config.json...');
	await fs.writeFile('stascii.config.json', JSON.stringify(config, null, 2));
	s.stop('Created stascii.config.json');

	s.start('Creating pages directory...');
	await fs.mkdir('pages');
	await fs.writeFile(
		'pages/index.adoc',
		`:title: Welcome\n\n= Welcome to My Site\n\nYou can edit this file to get started!\n\nIf you have any questions, https://github.com/Hugos68/stascii[check the documentation on GitHub.]`,
	);
	s.stop('Created pages directory');
}
