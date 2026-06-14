export { calculator } from './calculator';
export { searchTool } from './search';
export { readFile, writeFile } from './fileTools';

import { calculator } from './calculator';
import { searchTool } from './search';
import { readFile, writeFile } from './fileTools';

export const allTools = [
  calculator,
  searchTool,
  readFile,
  writeFile
];