import dotenv from "dotenv";
dotenv.config();

// Node.js 16 polyfill for ReadableStream
if (typeof (global as any).ReadableStream === 'undefined') {
  (global as any).ReadableStream = require('stream').Readable;
}

import { ResearchAgent, CodeAgent, MathAgent } from "./agents";

async function main() {
  console.log("=== LangChain DeepAgents Demo ===\n");

  const mathAgent = new MathAgent();
  console.log("1. 使用数学代理计算:");
  const mathResult = await mathAgent.calculate("2^10 + 5 * 100");
  console.log(mathResult);
  console.log();

  const researchAgent = new ResearchAgent();
  console.log("2. 使用研究代理搜索:");
  const researchResult = await researchAgent.research("LangChain DeepAgents 最新进展");
  console.log(researchResult);
  console.log();

  const codeAgent = new CodeAgent();
  console.log("3. 使用代码代理生成代码:");
  const codeResult = await codeAgent.generateCode("创建一个简单的Python Hello World程序");
  console.log(codeResult);
  console.log();

  console.log("=== Demo 完成 ===");
}

main().catch(console.error);