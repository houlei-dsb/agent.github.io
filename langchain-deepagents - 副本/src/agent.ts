import { StateGraph, END, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { formatMessages } from "@langchain/core/messages";

// 定义状态接口
const StateAnnotation = Annotation.Root({
  messages: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  query: Annotation<string>,
});

// 创建LLM
const llm = new ChatOpenAI({
  modelName: process.env.MODEL_NAME || "qwen3.6-plus",
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  temperature: 0.7,
});

// 驾校推荐节点
async function recommendDrivingSchool(state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> {
  const prompt = `你是一个专业的驾校推荐顾问。请根据用户的需求推荐合适的驾校。

用户需求：${state.query}

请按照以下格式回复：
1. 分析用户需求（城市、价格预算、特殊需求等）
2. 推荐2-3家合适的驾校
3. 每家驾校的特点和优势

回复语言：中文`;

  const response = await llm.invoke([{ role: "user", content: prompt }]);
  
  return {
    messages: [`驾校推荐结果：\n${response.content}`],
  };
}

// 教练匹配节点
async function matchCoach(state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> {
  const prompt = `你是一个专业的驾考教练匹配顾问。请根据用户的偏好推荐合适的教练。

用户偏好：${state.query}

请按照以下格式回复：
1. 分析用户偏好（教学风格、专长科目、经验要求等）
2. 推荐2-3位合适的教练
3. 每位教练的特点、专长和教学风格

回复语言：中文`;

  const response = await llm.invoke([{ role: "user", content: prompt }]);
  
  return {
    messages: [`教练匹配结果：\n${response.content}`],
  };
}

// 考试答疑节点
async function answerExamQuestion(state: typeof StateAnnotation.State): Promise<Partial<typeof StateAnnotation.State>> {
  const prompt = `你是一个专业的驾考辅导老师。请详细解答用户关于驾考的问题。

用户问题：${state.query}

请提供详细、清晰的解答，包括步骤、技巧和注意事项。

回复语言：中文`;

  const response = await llm.invoke([{ role: "user", content: prompt }]);
  
  return {
    messages: [`考试答疑结果：\n${response.content}`],
  };
}

// 路由函数
function routeTask(state: typeof StateAnnotation.State): string {
  const query = state.query.toLowerCase();
  
  if (query.includes("驾校") || query.includes("学车") || query.includes("报名")) {
    return "recommendDrivingSchool";
  } else if (query.includes("教练") || query.includes("教学") || query.includes("老师")) {
    return "matchCoach";
  } else {
    return "answerExamQuestion";
  }
}

// 创建状态图
const workflow = new StateGraph(StateAnnotation)
  .addNode("recommendDrivingSchool", recommendDrivingSchool)
  .addNode("matchCoach", matchCoach)
  .addNode("answerExamQuestion", answerExamQuestion)
  .addConditionalEdges("__start__", routeTask, {
    recommendDrivingSchool: "recommendDrivingSchool",
    matchCoach: "matchCoach",
    answerExamQuestion: "answerExamQuestion",
  })
  .addEdge("recommendDrivingSchool", END)
  .addEdge("matchCoach", END)
  .addEdge("answerExamQuestion", END);

// 编译图
const app = workflow.compile();

// 导出agent
export const agent = app;

// 测试函数
async function testAgent() {
  const result = await app.invoke({
    query: "长沙驾校推荐",
    messages: [],
  });
  console.log(result.messages[0]);
}

// 如果直接运行则测试
if (require.main === module) {
  testAgent().catch(console.error);
}