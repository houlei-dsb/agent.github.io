import { tool } from "@langchain/core/tools";

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

export const searchTool = tool(
  async (query: string): Promise<string> => {
    const mockResults: SearchResult[] = [
      {
        title: "LangChain 官方文档",
        snippet: "LangChain 是一个用于构建由语言模型驱动的应用程序的框架。",
        url: "https://docs.langchain.com"
      },
      {
        title: "DeepAgents 介绍",
        snippet: "DeepAgents 是基于 LangChain 的高级智能代理框架，支持多模态和复杂任务。",
        url: "https://github.com/langchain-ai/langchain"
      },
      {
        title: "LLM 最佳实践",
        snippet: "大型语言模型应用开发的最佳实践指南，包括提示词工程和代理设计。",
        url: "https://www.promptingguide.ai"
      }
    ];

    return JSON.stringify(mockResults);
  },
  {
    name: "search",
    description: "用于搜索网络信息。输入应为搜索查询字符串"
  }
);