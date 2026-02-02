import json
from typing import Any

from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command

from review_agent.prompts import SYSTEM_PROMPT
from review_agent.state import AgentState
from review_agent.tools import ALL_TOOLS

BACKEND_TOOL_NAMES = {t.name for t in ALL_TOOLS}


def _get_frontend_tools(state: AgentState) -> list[Any]:
    """Extract frontend tools from CopilotKit state."""
    tools: list[Any] = []
    try:
        ck = state.get("copilotkit", {}) or {}
        actions = ck.get("actions", []) or []
        if isinstance(actions, list):
            tools.extend(actions)
    except Exception:
        pass
    return tools


async def chat_node(state: AgentState, config: RunnableConfig) -> Command[str]:
    model = ChatOpenAI(model="gpt-4o", temperature=0.2)

    frontend_tools = _get_frontend_tools(state)
    model_with_tools = model.bind_tools(
        [*ALL_TOOLS, *frontend_tools],
        parallel_tool_calls=False,
    )

    system = SystemMessage(content=SYSTEM_PROMPT)
    response = await model_with_tools.ainvoke(
        [system, *state["messages"]],
        config,
    )

    # Route: if there are tool calls for backend tools, go to tool_node
    if response.tool_calls:
        backend_calls = [
            tc for tc in response.tool_calls if tc["name"] in BACKEND_TOOL_NAMES
        ]
        if backend_calls:
            return Command(goto="tool_node", update={"messages": [response]})

    return Command(goto=END, update={"messages": [response]})


workflow = StateGraph(AgentState)
workflow.add_node("chat_node", chat_node)
workflow.add_node("tool_node", ToolNode(tools=ALL_TOOLS))
workflow.add_edge("tool_node", "chat_node")
workflow.set_entry_point("chat_node")

graph = workflow.compile()
