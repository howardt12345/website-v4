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

- Innovated [Ask AI](https://www.recollective.com/recollective-ai), Recollective's natural language Q&A system for qualitative research, across a Python backend service, a Java REST API, and a Vue.js chat panel; the retrieval pipeline covers vector search and document reranking, LLM-driven citation extraction with verbatim matching and deduplication, and query optimization
- Extended Ask AI with cross-study question answering, letting researchers query across multiple studies simultaneously; built scope controls at the study, activity, and task level, along with the study filter UI, history panel filtering, and backend multi-study authorization
- Shipped participant @mentions and segment filtering for Ask AI, including the frontend mention picker, segment option scoping, and backend authorization for restricting queries to specific participant cohorts
- Integrated AI capabilities into Live Meetings and Live Group Chats, connecting their transcript data to the Ask AI and insights pipelines; built contextualization that generates AI context from meeting transcripts and wired up the live activity ingestion flow
- Implemented the External Content activity for ingesting third-party video and audio files into the platform, covering AI summary generation, word cloud integration, Ask AI integration with verbatim extraction, multilingual translation, and lifecycle management across studies and sites
- Maintained multi-provider LLM support across services for Google Gemini (including thinking models), Anthropic Claude, and OpenAI GPT-4.1 / Azure OpenAI; implemented structured output handling, token budget controls, and fallback retry logic
- Engineered multilingual processing: built a CJK word splitter after evaluating several open-source libraries, implemented a chunked translation pipeline with fallback LLM support, and added regional dialect handling for Traditional Chinese (HK and TW)
- Added Langfuse observability to the backend AI services, enabling distributed tracing with session context and error events for systematic debugging of LLM pipeline failures in production
- Contributed to the Python-based conversation service for AI-moderated participant interviews; added pre-check logic to gracefully terminate conversations when prior context makes an objective inapplicable, and improved error resilience with model fallback and retry handling
- Remediated penetration-testing findings including prompt injection vulnerabilities, an interstitial for outbound external links, and XSS vulnerabilities; also implemented IP-change session invalidation as a security hardening measure