// Dinesh's origin story, told in his own voice — a flip-through journal.
// Names, places, and details are his; edit freely.

export interface StoryChapter {
	/** Two-digit chapter number, e.g. "01". */
	no: string;
	title: string;
	paragraphs: string[];
	/** Short handwritten margin note / pull-quote. */
	note?: string;
}

export const story: StoryChapter[] = [
	{
		no: "00",
		title: "Before we begin",
		paragraphs: [
			"Before the story starts, a thank you. None of this happened on my own. Every chapter in these pages exists because someone believed in me before I had proved myself. To my **Appa (Dad)** and **Amma (Mom)**—thank you for every sacrifice, every bit of encouragement, and every chance you gave me. This story is as much yours as it is mine.",
			"Teachers who believed in a kid with 35 marks. My family, who showed me what hard work looked like. Friends who made every classroom feel like home. Strangers who said one sentence at exactly the right time. This is for all of you—thank you for believing in me before I believed in myself.",
		],
		note: "I didn't get here alone.",
	},
	{
		no: "01",
		title: "It started at the movies",
		paragraphs: [
			"Honestly, the first spark came from Tamil cinema. I grew up watching films where the kid from a small town came back as a software engineer, carrying a laptop and bigger dreams. I didn't know what software engineering was—I just knew I wanted to build things that mattered.",
			"A few years later, someone who had worked with Dr. A.P.J. Abdul Kalam visited my school, Subash Matric. I don't remember his name, but I still remember one line: *build things that save people even a single paisa.* That idea stuck with me. From then on, I wasn't interested in just learning how things worked—I wanted to build them.",
		],
		note: "even one paisa counts",
	},
	{
		no: "02",
		title: "The hardware detour",
		paragraphs: [
			"There was a phase where I was certain I'd end up in hardware. Robotics became an obsession, Japan's tech expos were my version of Netflix, and every month I had a new dream to chase.",
			"Then I found Linus Tech Tips, and PC building quietly became an obsession. I spent high school learning what went into a computer and why. Hardware engineering felt like the obvious next step.",
		],
		note: "robotics → Japan → building PCs",
	},
	{
		no: "03",
		title: "My path-makers",
		paragraphs: [
			"My biggest influence came from my sisters, Vino and Aarthi. Both landed great jobs at top MNCs in Chennai—a big deal where I grew up. Every Diwali they'd come home, and before heading back, they'd leave me with the same advice:",
			'"Study well, get a good job, and take care of the family." I didn\'t realize it then, but those words stayed with me.',
		],
		note: "study hard. grab everything.",
	},
	{
		no: "04",
		title: "One tick changed everything",
		paragraphs: [
			"When my 12th results came out, I knew engineering counselling wasn't going to work in my favor. I was already planning to join Karpagam, with KPR as another option. Then I visited Sri Eshwar. While filling out the application, I noticed a brand-new program at the top: **AI & Data Science**. I didn't know much about it, but something about it felt right, so I ticked the box.",
			'The director called me in: "M1, M2, M3 — the engineering maths are tough. Will you pass?" Same answer I always give when I want something: "Yes, I will." And I did.',
		],
		note: "ticked AI & Data Science on a hunch. best one ever.",
	},
	{
		no: "05",
		title: "To be continued",
		paragraphs: [
			"One last thank you before this chapter closes — to my college friends and my seniors at Sri Eshwar. You turned four years into a second home, and somewhere in there I found a whole new family.",
			"*A hint for the chapters still to come —*\n•  five corners\n•  a white heart 🤍\n•  Beethoven's Fifth in Morse (· · · —) — the letter V, for Victory\n•  an orange silk saree\n*…you'll know when you know.*",
			"That's how I became an engineering student. How I became a developer — the late nights, the first job, the things that broke and taught me — that's a different story. And I'm still writing it.",
		],
		note: "the dev chapter is still being written →",
	},
];
