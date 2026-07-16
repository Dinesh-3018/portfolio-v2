import type { Principle } from "./types";

// How I work — Dinesh's own principles, in his voice. Takeaways render in the
// handwritten font. Keep four (the layout alternates and pairs one accent each).
export const principles: Principle[] = [
  {
    title: "Someone kind got here first",
    body: "Whatever's got me stuck — a stubborn bug, a pattern I can't crack, some idea I cooked up at 1am — chances are someone lovely already hit it and left notes. So I learn from them, borrow the good bits with a quiet thank-you, and try to leave things a little tidier than I found them. When my version turns out handy, it goes right back to the community — the favour, happily passed along.",
    takeaway: "pinch the good bits, pay it forward",
    accent: "blue",
  },
  {
    title: "Curiosity in, good questions out",
    body: "Curiosity drags me into rabbit holes — and a good question is how I climb back out. I'd rather ask the dumb-sounding one and actually understand than skate by on a vague guess. That's usually where the real learning is hiding.",
    takeaway: "ask the dumb question, get the real answer",
    accent: "pink",
  },
  {
    title: "Write it for the next person",
    body: "Whoever inherits my code shouldn't need a tour guide. Clear names, an obvious shape, nothing clever for its own sake. Making it easy to read is half the job.",
    takeaway: "the next person shouldn't need a map",
    accent: "yellow",
  },
  {
    title: "Good takes patience",
    body: "Getting something working is the quick part; making it genuinely good is the slow, patient one. I aim high, miss sometimes, and keep chipping at it. Perfect was never the target — a little better each time is.",
    takeaway: "better each time, not perfect",
    accent: "green",
  },
];
