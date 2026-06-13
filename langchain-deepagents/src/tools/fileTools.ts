import { tool } from "@langchain/core/tools";
import * as fs from 'fs';
import * as path from 'path';

export const readFile = tool(
  async (filePath: string): Promise<string> => {
    try {
      const absolutePath = path.resolve(filePath);
      const content = fs.readFileSync(absolutePath, 'utf-8');
      return `文件内容:\n${content}`;
    } catch (error) {
      return `读取文件失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  },
  {
    name: "read_file",
    description: "用于读取文件内容。输入应为文件路径"
  }
);

export const writeFile = tool(
  async (args: { filePath: string; content: string }): Promise<string> => {
    try {
      const { filePath, content } = typeof args === 'string' ? JSON.parse(args) : args;
      const absolutePath = path.resolve(filePath);
      fs.writeFileSync(absolutePath, content, 'utf-8');
      return `文件写入成功: ${absolutePath}`;
    } catch (error) {
      return `写入文件失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  },
  {
    name: "write_file",
    description: "用于写入文件。输入应为包含filePath和content的JSON对象"
  }
);