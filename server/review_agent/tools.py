import json
import os
import re

import httpx
from langchain_core.tools import tool
from openai import OpenAI


def _github_headers() -> dict[str, str]:
    token = os.environ["GITHUB_TOKEN"]
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }


def _parse_pr_url(pr_url: str) -> tuple[str, str, int]:
    """Extract owner, repo, and PR number from a GitHub PR URL."""
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)/pull/(\d+)", pr_url)
    if not match:
        raise ValueError(f"Invalid PR URL: {pr_url}")
    return match.group(1), match.group(2), int(match.group(3))


@tool
def fetch_pr_diff(pr_url: str) -> str:
    """Fetch PR metadata and diff from GitHub.

    Args:
        pr_url: Full GitHub PR URL (e.g. https://github.com/owner/repo/pull/123)
    """
    owner, repo, pr_number = _parse_pr_url(pr_url)
    headers = _github_headers()

    # Fetch PR metadata
    meta_resp = httpx.get(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}",
        headers=headers,
    )
    meta_resp.raise_for_status()
    meta = meta_resp.json()

    # Fetch diff
    diff_headers = {**headers, "Accept": "application/vnd.github.v3.diff"}
    diff_resp = httpx.get(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}",
        headers=diff_headers,
    )
    diff_resp.raise_for_status()
    diff_text = diff_resp.text

    # Truncate diff to 30k chars
    if len(diff_text) > 30000:
        diff_text = diff_text[:30000] + "\n\n... [diff truncated at 30k characters]"

    return json.dumps({
        "title": meta["title"],
        "author": meta["user"]["login"],
        "body": meta.get("body", "") or "",
        "state": meta["state"],
        "additions": meta["additions"],
        "deletions": meta["deletions"],
        "changed_files": meta["changed_files"],
        "diff": diff_text,
    })


@tool
def analyze_diff(pr_title: str, diff: str) -> str:
    """Analyze a PR diff using GPT-4o and return structured findings.

    Args:
        pr_title: Title of the pull request.
        diff: The raw diff text to analyze.
    """
    client = OpenAI()

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a senior code reviewer. Analyze the following PR diff and return a JSON object with:\n"
                    '- "summary": A 2-3 sentence overview of the changes.\n'
                    '- "findings": An array of objects, each with:\n'
                    '  - "severity": one of "critical", "warning", "info", "suggestion"\n'
                    '  - "file": the file path\n'
                    '  - "line": approximate line number (integer)\n'
                    '  - "title": short title for the finding\n'
                    '  - "description": detailed explanation\n'
                    '  - "code_snippet": relevant code from the diff\n'
                    '  - "suggestion": concrete improvement suggestion\n\n'
                    "Return ONLY valid JSON, no markdown fences."
                ),
            },
            {
                "role": "user",
                "content": f"PR Title: {pr_title}\n\nDiff:\n{diff}",
            },
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content or "{}"


@tool
def post_github_review(pr_url: str, review_body: str) -> str:
    """Post a review comment on a GitHub PR.

    Args:
        pr_url: Full GitHub PR URL.
        review_body: The review body text in markdown.
    """
    owner, repo, pr_number = _parse_pr_url(pr_url)
    headers = _github_headers()

    resp = httpx.post(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/reviews",
        headers=headers,
        json={"body": review_body, "event": "COMMENT"},
    )
    resp.raise_for_status()
    review = resp.json()
    return f"Review posted successfully: {review['html_url']}"


@tool
def create_github_issue(repo_url: str, title: str, body: str) -> str:
    """Create a GitHub issue on the repository.

    Args:
        repo_url: Repository URL (e.g. https://github.com/owner/repo).
        title: Issue title.
        body: Issue body in markdown.
    """
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", repo_url)
    if not match:
        raise ValueError(f"Invalid repo URL: {repo_url}")
    owner, repo = match.group(1), match.group(2)
    headers = _github_headers()

    resp = httpx.post(
        f"https://api.github.com/repos/{owner}/{repo}/issues",
        headers=headers,
        json={"title": title, "body": body},
    )
    resp.raise_for_status()
    issue = resp.json()
    return f"Issue created successfully: {issue['html_url']}"


ALL_TOOLS = [fetch_pr_diff, analyze_diff, post_github_review, create_github_issue]
