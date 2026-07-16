import type { TimelineEntry } from "./types";

// Real career history for Dinesh Ganesan, from his resume.
export const timeline: TimelineEntry[] = [
  {
    company: "Southern Guild",
    role: "SOFTWARE ENGINEER",
    description:
      "Scaled a NestJS backend handling 6M+ records in PostgreSQL, cutting response times 40% and enabling 100K+ daily requests. Dropped natural-language search latency 12× (250ms → 20ms) with a custom retrieval layer, and led a RAG chat app to MVP in under 8 weeks with 500+ users.",
    period: "MAY 2025 – PRESENT",
    accent: "blue",
  },
  {
    company: "Saptang Labs",
    role: "SOFTWARE DEVELOPER INTERN",
    description:
      "Built the frontend for a Telegram monitoring tool tracking 4,500 groups, reengineered a micro-frontend architecture that cut build time 25%, and stood up a local npm registry with MFA that reduced team development time by 45%.",
    period: "JAN 2024 – APR 2025",
    accent: "pink",
  },
  {
    company: "Sri Eshwar College of Engineering",
    role: "B.TECH · AI & DATA SCIENCE",
    description:
      "Bachelor of Technology in Artificial Intelligence and Data Science, CGPA 7.30/10. Coursework across DSA, Operating Systems, Computer Networks, DBMS, Machine Learning, and Web Development.",
    period: "JUN 2021 – JUN 2025",
    accent: "green",
    kind: "education",
  },
];
