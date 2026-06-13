import { createAgentExecutor, createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { searchTool } from "../tools";

export class ResearchAgent {
  private agentExecutor: any;
  private llm: ChatOpenAI;

  constructor(modelName: string = "gpt-4o-mini") {
    this.llm = new ChatOpenAI({
      modelName,
      temperature: 0.3,
    });
    this.agentExecutor = this.createAgent();
  }

  private createAgent(): any {
    const tools = [searchTool];

    const agentRunnable = createReactAgent({
      llm: this.llm,
      tools: tools as any,
    });

    return createAgentExecutor({
      agentRunnable,
      tools: tools as any,
    });
  }

  async research(query: string): Promise<string> {
    const result = await this.agentExecutor.invoke({
      input: `进行深度研究: ${query}\n请搜索相关信息并提供详细的研究报告。`,
    });
    return result.agentOutcome?.returnValues?.output || result.agentOutcome?.log || "No result";
  }
}