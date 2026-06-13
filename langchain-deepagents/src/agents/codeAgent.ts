import { createAgentExecutor, createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { writeFile, readFile } from "../tools";

export class CodeAgent {
  private agentExecutor: any;
  private llm: ChatOpenAI;

  constructor(modelName: string = "gpt-4o-mini") {
    this.llm = new ChatOpenAI({
      modelName,
      temperature: 0.2,
    });
    this.agentExecutor = this.createAgent();
  }

  private createAgent(): any {
    const tools = [writeFile, readFile];

    const agentRunnable = createReactAgent({
      llm: this.llm,
      tools: tools as any,
    });

    return createAgentExecutor({
      agentRunnable,
      tools: tools as any,
    });
  }

  async generateCode(prompt: string): Promise<string> {
    const result = await this.agentExecutor.invoke({
      input: `根据以下需求生成代码: ${prompt}\n请将生成的代码写入适当的文件中。`,
    });
    return result.agentOutcome?.returnValues?.output || result.agentOutcome?.log || "No result";
  }

  async reviewCode(filePath: string): Promise<string> {
    const result = await this.agentExecutor.invoke({
      input: `请审查以下文件的代码: ${filePath}\n分析代码质量、潜在问题和改进建议。`,
    });
    return result.agentOutcome?.returnValues?.output || result.agentOutcome?.log || "No result";
  }
}