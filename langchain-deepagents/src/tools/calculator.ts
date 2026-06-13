import { tool } from "@langchain/core/tools";

export const calculator = tool(
  async (input: string): Promise<string> => {
    try {
      const sanitizedInput = input.replace(/[^0-9+\-*/().\s]/g, '');
      const result = eval(sanitizedInput);
      return `计算结果: ${result}`;
    } catch (error) {
      return `计算错误: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  },
  {
    name: "calculator",
    description: "用于执行数学计算。输入应为有效的数学表达式，例如：2 + 3 * 4"
  }
);