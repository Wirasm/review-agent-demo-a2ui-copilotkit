from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    pr_url: str
    pr_title: str
    pr_author: str
    findings: list[dict]
    summary: str
