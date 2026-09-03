import type { SkillGroup } from "./types";

// Real stack for Dinesh Ganesan — group labels are used as section headers.
export const skillGroups: SkillGroup[] = [
  { label: "LANGUAGES", items: ["JavaScript", "TypeScript", "Python"] },
  {
    label: "FRONTEND",
    items: [
      "React.js",
      "Next.js",
      "Redux",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
      "Micro-frontend architecture",
      "Design systems",
    ],
  },
  {
    label: "BACKEND",
    items: [
      "Node.js",
      "NestJS",
      "Flask",
      "RESTful APIs",
      "Microservices",
      "Repository design pattern",
    ],
  },
  {
    label: "DATABASES & ORM",
    items: ["PostgreSQL", "Prisma", "Database design and optimization"],
  },
  {
    label: "AUTH & IDENTITY",
    items: ["OAuth 2.0", "OIDC", "Role-based authorization (RBAC)", "Scopes", "Session management"],
  },
  {
    label: "VOICE & REAL-TIME",
    items: ["WebRTC", "Voice agents", "Real-time audio pipelines"],
  },
  {
    label: "CLOUD & INFRA",
    items: ["AWS", "Azure", "Oracle Cloud", "Cloudflare (DNS, CDN, edge/security config)", "Docker"],
  },
  {
    label: "DEVOPS & TOOLING",
    items: ["Git", "Linux", "Postman", "Nexus (private npm registry)", "CI/CD"],
  },
  {
    label: "OTHER",
    items: ["Playing cards", "UNO", "Building weird ideas into products"],
  },
];
