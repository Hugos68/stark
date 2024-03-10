import { promises as fs } from 'fs';

await fs.rename('build/index.html', 'build/template.html');