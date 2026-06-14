import { createAgentExecutor, createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";
import { allTools } from "../tools";

export abstract class BaseAgent {
  protected agentExecutor: any;
  protected llm: ChatOpenAI;

  constructor(modelName: string = "gpt-4o-mini") {
    this.llm = new ChatOpenAI({
      modelName,
      temperature: 0.7,
    });
    this.agentExecutor = this.createAgent();
  }

  protected createAgent(): any {
    const agentRunnable = createReactAgent({
      llm: this.llm,
      tools: allTools as any,
    });

    return createAgentExecutor({
      agentRunnable,
      tools: allTools as any,
    });
  }

  async run(input: string): Promise<string> {
    const result = await this.agentExecutor.invoke({ input });
    return result.agentOutcome?.returnValues?.output || result.agentOutcome?.log || "No result";
  }

  async chat(messages: BaseMessage[]): Promise<string> {
    const result = await this.agentExecutor.invoke({ input: "", chatHistory: messages });
    return result.agentOutcome?.returnValues?.output || result.agentOutcome?.log || "No result";
  }
}