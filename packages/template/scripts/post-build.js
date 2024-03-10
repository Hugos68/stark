import { promises as fs } from 'fs';
import { join } from 'path';

await fs.rename(join('build', 'index.html'), join('build', 'template.html'));