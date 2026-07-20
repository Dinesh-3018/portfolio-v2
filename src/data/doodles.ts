/**
 * Desk doodles — a Google-Doodle-style calendar for the dock. On days that
 * match, a little tag dangles off the navbar; every other day, nothing renders.
 *
 * A day only belongs here if its GREGORIAN date is predictable. Three separate
 * classes of day drift and must NOT be added as a bare "MM-DD":
 *   - lunar        — Diwali, Eid, Holi, Onam. Move every year.
 *   - solar        — Pongal, Puthandu, Thiruvalluvar Day. These are pinned to
 *                    the Sun's entry into a sign, NOT to a calendar date, so
 *                    they drift too. Pongal really does land on Jan 15 in some
 *                    years (see PONGAL below) — this is the trap that bit us.
 *   - weekday-anchored — Ada Lovelace Day (2nd Tue of Oct), Sysadmin Day (last
 *                    Fri of Jul), Friendship Day in India (1st Sun of Aug).
 * Ordinal-of-year days (Programmers' Day = day 256) also shift in leap years,
 * so they are COMPUTED below rather than pinned.
 *
 * Two key formats are supported. An exact "YYYY-MM-DD" key wins over a bare
 * "MM-DD" one, which is how a drifting day gets pinned per year.
 *
 * NOTE: dateKey can legitimately return "02-29" — an entry keyed that way
 * would only ever fire once every four years. Probably not what you want.
 *
 * Preview any day locally with `?doodle=MM-DD` or `?doodle=YYYY-MM-DD`.
 */
export interface DeskDoodle {
  /** The doodle mark itself. */
  emoji: string;
  /** Short lowercase label on the tag, e.g. "chess day". */
  label: string;
  /** Full name, used for the tooltip + screen readers. */
  title: string;
  /**
   * How the tag behaves. Three tiers:
   *
   *   undefined    playful — cream paper, bouncy drop, sways, grab and fling it.
   *                The default, and what most festivals should be.
   *   "respectful" cream paper, gentle entrance, still, NOT grabbable. For
   *                dignified national days — Gandhi Jayanti is a wreath-laying
   *                and a dry day, not a toy, but it isn't mourning either.
   *   "solemn"     muted grey paper, gentle entrance, still, NOT grabbable.
   *                Remembrance and mourning only.
   *
   * Getting this wrong cuts both ways: a bouncy toy on a mourning day is
   * offensive, but a grey motionless tag on Pongal is just as wrong.
   */
  tone?: "respectful" | "solemn";
}

type DoodleEntry = DeskDoodle & {
  key: string;
  /** Higher wins when two entries share a date. See TAMIL below. */
  priority?: number;
};

/**
 * Precedence ladder. Only one tag can render per day, and this is a Tamil
 * engineer's site, so Tamil days outrank everything else on a shared date.
 *
 * This is compared across BOTH key formats — a per-year "YYYY-MM-DD" pin does
 * NOT automatically beat a bare "MM-DD" entry; the higher priority wins, and
 * the pin only breaks an exact tie (it is the more specific statement).
 *
 * A live example: Karthigai Deepam falls on 2027-12-11, which is also
 * Bharathiar's birthday on the bare key "12-11". Festival outranks figure, so
 * that year shows Karthigai.
 */
const TAMIL_MOURNING = 50;
const TAMIL_FESTIVAL = 40;
const TAMIL_STATE = 30;
const TAMIL_FIGURE = 20;
const INDIA = 10;
/** Everything else defaults to 0. */

/**
 * Thai Pongal / Makar Sankranti is solar, not fixed: it tracks the Sun's entry
 * into Capricorn, resolved by a sunrise rule, and genuinely alternates between
 * Jan 14 and Jan 15. Pinned per year rather than guessed.
 *
 * ⚠️ Verified through 2032 — EXTEND THIS BEFORE JANUARY 2033 or the flagship
 * Tamil day silently stops appearing.
 */
const PONGAL_DATES = [
  "2026-01-14",
  "2027-01-15",
  "2028-01-15",
  "2029-01-14",
  "2030-01-14",
  "2031-01-15",
  "2032-01-15",
] as const;

const PONGAL: DeskDoodle = {
  emoji: "🌾",
  label: "pongal",
  title: "Pongal / Makar Sankranti",
};

/** Shift a "YYYY-MM-DD" key by n days (handles month/year rollover). */
function shiftKey(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Days 2 and 3 of Pongal, DERIVED from PONGAL_DATES rather than pinned
 * separately — a parallel hand-written array would eventually desync from
 * Pongal itself, and the whole point is that the four days read as one arc.
 */
const MAATTU_PONGAL_DATES = PONGAL_DATES.map((k) => shiftKey(k, 1));
const KAANUM_PONGAL_DATES = PONGAL_DATES.map((k) => shiftKey(k, 2));

const ENTRIES: DoodleEntry[] = [
  { key: "01-01", emoji: "🎊", label: "new year", title: "New Year's Day" },
  // Pongal is injected per-year from PONGAL_DATES — no bare "01-14" key, so it
  // can never fire on the wrong day.
  ...PONGAL_DATES.map((key) => ({ key, ...PONGAL, priority: TAMIL_FESTIVAL })),
  {
    priority: INDIA,
    key: "01-26",
    emoji: "🇮🇳",
    label: "republic day",
    title: "Republic Day (India)",
  },
  { key: "02-14", emoji: "❤️", label: "valentine's", title: "Valentine's Day" },
  {
    priority: INDIA,
    key: "02-28",
    emoji: "🔬",
    label: "science day",
    title: "National Science Day (India)",
  },
  {
    key: "03-08",
    emoji: "💐",
    label: "women's day",
    title: "International Women's Day",
  },
  { key: "03-14", emoji: "🥧", label: "pi day", title: "Pi Day — 3.14" },
  { key: "04-01", emoji: "🃏", label: "fools' day", title: "April Fools' Day" },
  // Puthandu was audited and IS safe on 04-14 through 2028+: the Chithirai-1
  // sunset rule absorbs the drift that moves Pongal. Leave it pinned.
  {
    key: "04-14",
    emoji: "🌅",
    label: "puthandu",
    title: "Puthandu — Tamil New Year",
    priority: TAMIL_FESTIVAL,
  },
  { key: "04-22", emoji: "🌍", label: "earth day", title: "Earth Day" },
  {
    key: "05-04",
    emoji: "🌌",
    label: "may the 4th",
    title: "Star Wars Day — May the 4th be with you",
  },
  {
    key: "05-18",
    emoji: "🕯️",
    label: "mullivaikkal",
    title: "Mullivaikkal Remembrance Day — Tamil Genocide Remembrance",
    tone: "solemn",
    priority: TAMIL_MOURNING,
  },
  {
    key: "06-05",
    emoji: "🌱",
    label: "environment day",
    title: "World Environment Day",
  },
  // "music day" alone reads as wrong in India, where 06-21 is overwhelmingly
  // International Day of Yoga. Spell the observance out.
  {
    key: "06-21",
    emoji: "🎶",
    label: "world music day",
    title: "World Music Day",
  },
  { key: "07-17", emoji: "😄", label: "emoji day", title: "World Emoji Day" },
  {
    key: "07-20",
    emoji: "♟️",
    label: "chess day",
    title: "International Chess Day",
  },
  // Likewise: Friendship Day in India is the first Sunday of August, so the
  // bare label read as a factual error. This is the UN observance.
  {
    key: "07-30",
    emoji: "🤝",
    label: "day of friendship",
    title: "International Day of Friendship (UN)",
  },
  {
    priority: INDIA,
    key: "08-15",
    emoji: "🇮🇳",
    label: "independence day",
    title: "Independence Day (India)",
  },
  {
    key: "08-19",
    emoji: "📷",
    label: "photo day",
    title: "World Photography Day",
  },
  {
    priority: INDIA,
    key: "09-05",
    emoji: "📚",
    label: "teachers' day",
    title: "Teachers' Day (India)",
  },
  // Programmers' Day is COMPUTED (day 256 → Sep 12 in leap years). See below.
  {
    priority: INDIA,
    key: "09-15",
    emoji: "⚙️",
    label: "engineers' day",
    title: "Engineers' Day (India)",
  },
  {
    key: "10-01",
    emoji: "☕",
    label: "coffee day",
    title: "International Coffee Day",
  },
  // A national holiday marked with wreath-laying at Raj Ghat and a nationwide
  // dry day. Dignified, not mourning — so respectful, not solemn.
  {
    priority: INDIA,
    key: "10-02",
    emoji: "🕊️",
    label: "gandhi jayanti",
    title: "Gandhi Jayanti",
    tone: "respectful",
  },
  { key: "10-31", emoji: "🎃", label: "halloween", title: "Halloween" },
  {
    priority: INDIA,
    key: "11-14",
    emoji: "🪁",
    label: "children's day",
    title: "Children's Day (India)",
  },
  { key: "12-25", emoji: "🎄", label: "christmas", title: "Christmas" },
  {
    key: "12-31",
    emoji: "🥂",
    label: "new year's eve",
    title: "New Year's Eve",
  },

  // ---- Tamil festivals (per-year pins; see maintenance warning above) ----
  ...MAATTU_PONGAL_DATES.map((key) => ({
    key,
    emoji: "🐂",
    label: "maattu pongal",
    title: "Maattu Pongal · Thiruvalluvar Day — மாட்டுப் பொங்கல்",
    priority: TAMIL_FESTIVAL,
  })),
  ...KAANUM_PONGAL_DATES.map((key) => ({
    key,
    emoji: "🫂",
    label: "kaanum pongal",
    title: "Kaanum Pongal — காணும் பொங்கல்",
    priority: TAMIL_FESTIVAL,
  })),
  // Thaipusam: 2028 omitted on purpose — a nakshatra kshaya year where Poosam
  // prevails at neither sunrise, so the date genuinely splits. A gap beats a
  // coin-flip.
  ...[
    "2026-02-01",
    "2027-01-22",
    "2029-01-30",
    "2030-01-19",
    "2031-02-06",
    "2032-01-27",
  ].map((key) => ({
    key,
    emoji: "🦚",
    label: "thaipusam",
    title: "Thaipusam — தைப்பூசம், Murugan's vel",
    priority: TAMIL_FESTIVAL,
  })),
  ...[
    "2026-02-15",
    "2027-03-06",
    "2028-02-23",
    "2029-02-11",
    "2030-03-02",
    "2031-02-20",
    "2032-03-10",
  ].map((key) => ({
    key,
    emoji: "🔱",
    label: "sivarathri",
    title: "Maha Sivarathri — மகா சிவராத்திரி",
    priority: TAMIL_FESTIVAL,
  })),
  // Vinayagar, not "Ganesh" — Tamil Nadu keeps it a one-day home rite, not
  // Maharashtra's ten-day arc, so the tag marks the Chaturthi alone.
  // 2031 trap: an adhika masa makes a naive calculation output 2031-08-22.
  ...[
    "2026-09-14",
    "2027-09-04",
    "2028-08-23",
    "2029-09-11",
    "2030-09-01",
    "2031-09-20",
    "2032-09-08",
  ].map((key) => ({
    key,
    emoji: "🐘",
    label: "vinayagar",
    title: "Vinayagar Chaturthi — விநாயகர் சதுர்த்தி",
    priority: TAMIL_FESTIVAL,
  })),
  // 2027 omitted: the lanes split on that year's Navaratri start.
  ...[
    "2026-10-11",
    "2028-09-19",
    "2029-10-08",
    "2030-09-28",
    "2031-10-17",
    "2032-10-05",
  ].map((key) => ({
    key,
    emoji: "🎎",
    label: "golu begins",
    title: "Navaratri / Golu begins — நவராத்திரி கொலு",
    priority: TAMIL_FESTIVAL,
  })),
  ...[
    "2026-10-20",
    "2027-10-09",
    "2028-09-27",
    "2029-10-16",
    "2030-10-06",
    "2031-10-25",
    "2032-10-14",
  ].map((key) => ({
    key,
    emoji: "✍️",
    label: "vijayadashami",
    title: "Vijayadashami — Vidyarambham, the first letters traced in rice",
    priority: TAMIL_FESTIVAL,
  })),
  // Tamil Nadu observes Naraka Chaturdashi (pre-dawn oil bath, dawn pattasu),
  // NOT the North's Lakshmi Puja on Amavasya — they diverge in 2027 and 2031,
  // so a pan-Indian date source is wrong 2 years in 7. 🎆 not 🪔 on purpose:
  // the lamp belongs to Karthigai Deepam.
  ...[
    "2026-11-08",
    "2027-10-28",
    "2028-10-17",
    "2029-11-05",
    "2030-10-26",
    "2031-11-13",
    "2032-11-02",
  ].map((key) => ({
    key,
    emoji: "🎆",
    label: "deepavali",
    title: "Deepavali · தீபாவளி",
    priority: TAMIL_FESTIVAL,
  })),
  // Solar-anchored, where North India's Kartik Purnima is lunar — they differ
  // in 6 of 7 years by up to 29 days. 2032 omitted: two Krittikas fall inside
  // that year's Karthigai month and the sources split.
  ...[
    "2026-11-24",
    "2027-12-11",
    "2028-12-01",
    "2029-11-20",
    "2030-12-08",
    "2031-11-28",
  ].map((key) => ({
    key,
    emoji: "🪔",
    label: "karthigai",
    title: "Karthigai Deepam — கார்த்திகை தீபம்",
    priority: TAMIL_FESTIVAL,
  })),
  ...["2026-12-20", "2028-01-08", "2028-12-27", "2031-01-04", "2031-12-24"].map(
    (key) => ({
      key,
      emoji: "🛕",
      label: "vaikunta",
      title: "Vaikunta Ekadasi — வைகுண்ட ஏகாதசி, the Paramapada Vasal opens",
      priority: TAMIL_FESTIVAL,
    }),
  ),
  // Margazhi 1. NOT a bare "12-16": it only lands there for 2026-2032 because
  // the Tamil sunset rule absorbs the drift; 2028 and 2032 have the ingress
  // late on Dec 15 and roll forward. Label says "begins" because the tag marks
  // day 1 and would otherwise assert something false on the other 29 days.
  ...[
    "2026-12-16",
    "2027-12-16",
    "2028-12-16",
    "2029-12-16",
    "2030-12-16",
    "2031-12-16",
    "2032-12-16",
  ].map((key) => ({
    key,
    emoji: "🎻",
    label: "margazhi begins",
    title:
      "மார்கழி Margazhi begins — Thiruppavai, kolams, the Chennai Music Season",
    priority: TAMIL_FESTIVAL,
  })),
  {
    key: "09-08",
    emoji: "⛪",
    label: "velankanni",
    title: "Velankanni feast — Our Lady of Good Health, Nagapattinam",
    priority: TAMIL_FESTIVAL,
  },

  // ---- Tamil state + language days ----
  // Semmozhi Naal: the formal GoI notification is usually cited as October
  // 2004, but June 6 is the date actually observed. Do not "correct" this.
  {
    key: "06-06",
    emoji: "📖",
    label: "semmozhi naal",
    title: "Semmozhi Naal — Tamil declared a Classical Language, 6 June 2004",
    priority: TAMIL_STATE,
  },
  // July 18, NOT Nov 1. Nov 1 is Kerala/Karnataka/Andhra formation day; Tamil
  // Nadu marks the 1967 resolution renaming Madras State, made the official
  // state day in 2022.
  {
    key: "07-18",
    emoji: "🏛️",
    label: "tamil nadu day",
    title: "Tamil Nadu Day — தமிழ்நாடு நாள்",
    tone: "respectful",
    priority: TAMIL_STATE,
  },

  // ---- Tamil figures ----
  {
    key: "02-19",
    emoji: "📜",
    label: "tamil thatha",
    title: "உ. வே. சாமிநாதையர் — Tamil Thatha, who recovered the Sangam corpus",
    priority: TAMIL_FIGURE,
  },
  {
    key: "04-29",
    emoji: "✊",
    label: "bharathidasan",
    title: "பாரதிதாசன் Bharathidasan — born 1891, the revolutionary poet",
    priority: TAMIL_FIGURE,
  },
  {
    key: "05-03",
    emoji: "⌨️",
    label: "sujatha",
    title:
      "சுஜாதா ரங்கராஜன் Sujatha — the writer who gave Tamil its computing words",
    priority: TAMIL_FIGURE,
  },
  // NOTE: the widespread "UN designated this World Students' Day" claim is
  // FALSE — it traces to a 2010 blog post. This is his birthday, nothing more.
  {
    key: "10-15",
    emoji: "🚀",
    label: "abdul kalam",
    title: "A. P. J. Abdul Kalam — born Rameswaram, 1931",
    tone: "respectful",
    priority: TAMIL_FIGURE,
  },
  {
    key: "12-11",
    emoji: "🪶",
    label: "bharathiar",
    title: "பாரதியார் பிறந்தநாள் — Mahakavi Subramania Bharati, born 1882",
    priority: TAMIL_FIGURE,
  },
  {
    key: "12-22",
    emoji: "🔢",
    label: "ramanujan",
    title:
      "Ramanujan Jayanti — Tamil Nadu State IT Day & National Mathematics Day",
    priority: TAMIL_FIGURE,
  },
];

/**
 * Only one tag can render per day, so a shared key has to resolve to exactly
 * one entry. Higher `priority` wins (that's how Tamil days take precedence).
 * A tie is a genuine authoring mistake — two entries silently overwriting each
 * other in a plain object literal is how a day vanishes with no error and no
 * type failure — so a tie throws at module load and breaks the build, not the
 * page.
 */
type Ranked = { doodle: DeskDoodle; priority: number };

function buildDoodles(entries: DoodleEntry[]): Record<string, Ranked> {
  const out: Record<string, Ranked> = {};
  for (const { key, priority = 0, ...doodle } of entries) {
    const held = out[key];
    if (held) {
      if (priority === held.priority) {
        throw new Error(
          `Duplicate desk-doodle key "${key}" — "${held.doodle.title}" vs "${doodle.title}" ` +
            `at equal priority. Only one tag can render per day: pick one, or rank them ` +
            `with the precedence ladder (TAMIL_FESTIVAL, TAMIL_FIGURE, INDIA…).`,
        );
      }
      if (priority < held.priority) continue; // incumbent outranks this entry
    }
    out[key] = { doodle, priority };
  }
  return out;
}

const RANKED = buildDoodles(ENTRIES);

/** The calendar, keyed by "MM-DD" or "YYYY-MM-DD". */
export const DOODLES: Record<string, DeskDoodle> = Object.fromEntries(
  Object.entries(RANKED).map(([key, { doodle }]) => [key, doodle]),
);

const PROGRAMMERS_DAY: DeskDoodle = {
  emoji: "💻",
  label: "programmers' day",
  title: "Programmers' Day — day 256",
};

/** "MM-DD" key for a date, in the visitor's local time (doodles are a
 *  "today, for you" touch — Google does the same). */
export function dateKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

/** Full "YYYY-MM-DD" key, for days pinned to a specific year. */
export function fullDateKey(date: Date): string {
  return `${date.getFullYear()}-${dateKey(date)}`;
}

/** Is this the 256th day of its year? Sep 13 normally, Sep 12 in leap years —
 *  computing it is the whole conceit of the day, so don't pin it. */
function isDay256(date: Date): boolean {
  const day256 = new Date(date.getFullYear(), 0, 256);
  return (
    date.getMonth() === day256.getMonth() && date.getDate() === day256.getDate()
  );
}

/**
 * The doodle for a given day, or null on ordinary days.
 *
 * When a per-year pin and a bare "MM-DD" entry both match, the higher
 * PRIORITY wins — not simply the more specific key. (Getting this backwards
 * was a real bug: key format silently outranked the ladder, so marking a
 * Tamil day high-priority did nothing against a pinned entry.) The pin only
 * wins an exact tie, where being the more specific statement is the
 * tiebreak.
 */
export function doodleFor(date: Date): DeskDoodle | null {
  const pinned = RANKED[fullDateKey(date)];
  const fixed = RANKED[dateKey(date)];
  if (pinned && fixed)
    return (fixed.priority > pinned.priority ? fixed : pinned).doodle;
  if (pinned) return pinned.doodle;
  if (fixed) return fixed.doodle;
  if (isDay256(date)) return PROGRAMMERS_DAY;
  return null;
}

/** Resolve a `?doodle=` override, accepting "MM-DD" or "YYYY-MM-DD". */
export function doodleForKey(key: string): DeskDoodle | null {
  const exact = DOODLES[key];
  if (exact) return exact;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (match) {
    const asDate = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
    );
    return doodleFor(asDate);
  }
  return null;
}
