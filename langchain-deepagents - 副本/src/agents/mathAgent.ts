import { createAgentExecutor, createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { calculator } from "../tools";

export class MathAgent {
  private agentExecutor: any;
  private llm: ChatOpenAI;

  constructor(modelName: string = "gpt-4o-mini") {
    this.llm = new ChatOpenAI({
      modelName,
      temperature: 0.0,
    });
    this.agentExecutor = this.createAgent();
  }

  private createAgent(): any {
    const tools = [calculator];

    const agentRunnable = createReactAgent({
      llm: this.llm,
      tools: tools as any,
    });

    return createAgentExecutor({
      agentRunnable,
      tools: tools as any,
    });
  }

  async calculate(expression: string): Promise<string> {
    const result = await this.agentExecutor.invoke({
      input: `计算: ${expression}`,
    });
    return result.agentOutcome?.returnValues?.output || result.agentOutcome?.log || "No result";
  }

  async solveProblem(problem: string): Promise<string> {
    const result = await this.agentExecutor.invoke({
      input: `解决数学问题: ${problem}\n请详细展示解题步骤。`,
    });
    return result.agentOutcome?.returnValues?.output || result.agentOutcome?.log || "No result";
  }
}