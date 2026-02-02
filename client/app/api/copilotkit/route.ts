import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

const deploymentUrl =
  process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123";

const reviewAgent = new LangGraphAgent({
  deploymentUrl,
  graphId: "review_agent",
  langsmithApiKey: process.env.LANGSMITH_API_KEY,
});

// Type assertion needed: @ag-ui/client version mismatch between
// @copilotkit/runtime and @ag-ui/langgraph (0.0.42 vs 0.0.43)
const runtime = new CopilotRuntime({
  agents: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    review_agent: reviewAgent as any,
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
