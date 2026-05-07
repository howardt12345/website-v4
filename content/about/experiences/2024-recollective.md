---
title: Software Developer
organization: Recollective, Inc.
start_date: 2024-05-01
end_date: 
location: Ottawa, ON, CA
skills: [Frontend, Backend, Full-Stack, Vue.js, TypeScript, SCSS, Java Spring, REST API, Python, MySQL, gRPC, WebSocket, Generative AI, LLM, Prompt Engineering, RAG, NLP, Vector Search, Multilingual, Observability, Security]
link: {
  url: https://recollective.com/,
  external: true,
}
---

- Innovated [Ask AI](https://www.recollective.com/recollective-ai), Recollective's natural language Q&A feature for qualitative research, spanning a Python retrieval service, Java REST API, and Vue.js chat panel; built the RAG pipeline with vector search, document reranking, LLM-driven citation extraction with verbatim matching and deduplication, and query optimization
- Extended Ask AI with cross-study question answering, enabling researchers to query across multiple studies simultaneously; implemented granular scope controls at the study, activity, and task level, along with the study filter UI, history panel filtering, and backend multi-study authorization
- Shipped participant @mentions and segment filtering for Ask AI, building the frontend mention picker, segment option scoping, and backend authorization to restrict queries to specific participant cohorts
- Integrated Ask AI and insights pipelines into Live Meetings and Live Group Chats by connecting real-time transcript data; built the meeting contextualization layer and wired up the live activity ingestion flow
- Implemented the External Content activity for ingesting third-party video and audio into the platform, delivering AI summary generation, word cloud integration, Ask AI with verbatim extraction, multilingual translation, and lifecycle management across studies and sites
- Extended multi-provider LLM support across services, integrating Google Gemini (including thinking models), Anthropic Claude, and OpenAI GPT-4.1 / Azure OpenAI with structured output handling, token budget controls, and fallback retry logic
- Engineered multilingual text processing: built a CJK word splitter after evaluating open-source alternatives, implemented a chunked translation pipeline with LLM fallback, and added regional dialect handling for Traditional Chinese (HK and TW)
- Instrumented backend AI services with Langfuse observability, enabling distributed tracing with session context and error events for systematic debugging of LLM pipeline failures in production
- Enhanced the AI-moderated participant interview service by adding pre-check logic to gracefully terminate inapplicable conversation objectives and implementing model fallback and retry handling for error resilience
- Resolved penetration-testing findings spanning prompt injection, XSS, and outbound link vulnerabilities, and implemented IP-change session invalidation as an additional security hardening measure