"""Generate the AI Agents in Practice curriculum scaffold (placeholder chapters)."""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(ROOT, "docs")

# (folder, sidebar_position, filename, title, description, planned coverage bullets)
CHAPTERS = [
    ("part1-foundations", 1, "01-what-is-an-agent", "What Is an AI Agent",
     "What an AI agent is, how it differs from a chatbot, and the agent loop.",
     ["Defining an agent: perception, reasoning, acting in a loop.",
      "Chatbot vs. agent vs. autonomous worker.",
      "The agent loop: observe, reason, act, repeat.",
      "Where agents run and what they touch."]),
    ("part1-foundations", 2, "02-how-llms-work", "How Language Models Work",
     "Tokens, attention, and why LLMs can reason — and hallucinate.",
     ["Tokens, embeddings, and next-token prediction.",
      "Attention and context windows.",
      "Why LLMs are good at reasoning and prone to hallucination.",
      "What this means for building reliable agents."]),
    ("part1-foundations", 3, "03-prompting-and-reasoning", "Prompting and Reasoning",
     "Prompting, chain-of-thought, and structured outputs for agents.",
     ["System, user, and tool-role messages.",
      "Chain-of-thought and structured reasoning.",
      "Structured outputs: JSON schemas and tool calls.",
      "Common prompting failure modes."]),
    ("part1-foundations", 4, "04-tools-and-memory", "Tools and Memory",
     "Giving agents tools, context, and memory that persists.",
     ["Tool calling: the bridge from text to actions.",
      "Context window limits and retrieval.",
      "Short-term vs. long-term memory.",
      "Storing state for long-horizon tasks."]),
    ("part2-architectures", 1, "01-react", "ReAct and Reasoning Loops",
     "ReAct: interleaving reasoning and acting in a loop.",
     ["The ReAct pattern: Thought, Action, Observation.",
      "Bounding loops for safety.",
      "Reflexion and self-correction.",
      "When reasoning loops beat single-shot answers."]),
    ("part2-architectures", 2, "02-frameworks", "Agent Frameworks",
     "OpenAI Agents SDK, Google ADK, and LangGraph compared.",
     ["What a framework provides: agents, tools, handoffs.",
      "OpenAI Agents SDK essentials.",
      "Google ADK essentials.",
      "Choosing a framework for a robot/agent project."]),
    ("part2-architectures", 3, "03-multi-agent", "Multi-Agent Systems",
     "Coordinating multiple agents that share a goal.",
     ["Single agent vs. multiple specialists.",
      "Orchestration patterns: supervisor, pipeline, swarm.",
      "Shared state and handoffs.",
      "Costs and failure modes of multi-agent designs."]),
    ("part2-architectures", 4, "04-evaluation", "Evaluation and Guardrails",
     "Eval-driven development and keeping agents safe.",
     ["Building a test harness for agents.",
      "Metrics: task success, cost, latency.",
      "Guardrails: validation, allowlists, human approval.",
      "Regression-testing agent behavior."]),
    ("part3-building", 1, "01-skills", "Skills and Tool Use",
     "Turning capabilities into reusable skills.",
     ["What a skill is: name, description, schema, implementation.",
      "Designing tool schemas the model can use reliably.",
      "Skill libraries and reuse.",
      "Connecting skills to real systems (APIs, robots)."]),
    ("part3-building", 2, "02-mcp", "The Model Context Protocol",
     "MCP: a standard way to connect agents to tools and data.",
     ["Why a standard protocol matters.",
      "MCP servers, clients, and resources.",
      "Building a simple MCP server.",
      "Security: scopes, secrets, and allowlists."]),
    ("part3-building", 3, "03-spec-driven", "Spec-Driven Development",
     "Writing the spec first, then building the agent to match.",
     ["The spec as a contract with the model.",
      "SKILL.md-style specifications.",
      "From spec to implementation to test.",
      "Iterating a spec with an eval harness."]),
    ("part3-building", 4, "04-worker", "From Script to Worker",
     "Turning a one-off prompt into a 24/7 autonomous worker.",
     ["What changes between a demo and a worker.",
      "Scheduling, retries, and state.",
      "Human-in-the-loop checkpoints.",
      "Operational playbooks."]),
    ("part4-deployment", 1, "01-containers", "Containerizing Agents",
     "Packaging an agent with Docker.",
     ["Why containers for agents.",
      "A minimal Dockerfile for a Python agent.",
      "Environment and secrets.",
      "Local dev vs. production images."]),
    ("part4-deployment", 2, "02-kubernetes", "Kubernetes, Dapr, and Ray",
     "Scaling agents with modern infrastructure.",
     ["Deploying agents on Kubernetes.",
      "Dapr for state and sidecars.",
      "Ray for distributed agent workloads.",
      "Costs and resource planning."]),
    ("part4-deployment", 3, "03-monitoring", "Observability and Operations",
     "Logs, traces, evals, and cost controls in production.",
     ["What to log in an agent system.",
      "Traces and LLM call visibility.",
      "Cost per task and budget limits.",
      "Incident response for autonomous systems."]),
    ("part5-business", 1, "01-roi", "The Economics of Digital Workers",
     "Whether an agent is worth building: the ROI math.",
     ["Human vs. digital worker economics.",
      "Cost per task, cost per hour.",
      "When to build, buy, or skip.",
      "Pricing and monetization models."]),
    ("part5-business", 2, "02-selling", "Getting Paid for Agents",
     "Employment, freelance, and startup routes.",
     ["The three routes: job, freelance, startup.",
      "Finding a vertical and a customer.",
      "Designing the system of record.",
      "Building a portfolio that proves value."]),
    ("appendices", 1, "a-glossary", "Glossary",
     "Key terms used across the book.",
     ["Agent, worker, skill, MCP, guardrail, eval, and more."]),
    ("appendices", 2, "b-resources", "Further Reading & Resources",
     "Papers, docs, and tools to go deeper.",
     ["Frameworks, SDKs, and MCP servers.",
      "Key papers on agents and reasoning.",
      "Communities and courses."]),
]

for folder, pos, slug, title, desc, bullets in CHAPTERS:
    d = os.path.join(DOCS, folder)
    os.makedirs(d, exist_ok=True)
    path = os.path.join(d, f"{slug}.mdx")
    body = "\n".join(f"- {b}" for b in bullets)
    content = (
        f"---\nsidebar_position: {pos}\n"
        f'description: "{desc}"\n'
        f"---\n\n# {title}\n\n"
        f"> **Status: placeholder.** This chapter is part of the working outline for\n"
        f"> *AI Agents in Practice: Building, Deploying, and Selling Autonomous Workers*.\n\n"
        f"## Planned coverage\n\n{body}\n\n"
        f"## Exercises\n\n*(to be added)*\n"
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Generated {len(CHAPTERS)} chapters under docs/")
