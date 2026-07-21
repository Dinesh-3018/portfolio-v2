/**
 * Solidarity banner at the top of the home page — Dinesh's statement,
 * signed with his name.
 *
 * Facts verified 21 Jul 2026: protests at Jantar Mantar since 6 June over
 * the NEET-UG 2026 paper leak (exam cancelled) and CBSE on-screen-marking
 * failures. Sonam Wangchuk on indefinite hunger strike since 28 June,
 * forcibly hospitalised 18 July, still fasting. The 20 July Sansad Chalo
 * march — Delhi's largest mobilisation in a decade — was met with tear gas
 * and lathi charge.
 *
 * Edit the prose freely. `enabled: false` removes the whole banner;
 * `hungerStrike.show: false` removes just the strike counter (e.g. when
 * the fast ends).
 */
export const supportBanner = {
  enabled: true,
  eyebrow: "SOLIDARITY · JANTAR MANTAR · DELHI",
  headline: "Standing with the students",
  message:
    "NEET-UG 2026 cancelled after a paper leak. CBSE marking left thousands in limbo. Aspirants deserve exams they can trust — and answers, not lathis.",
  hungerStrike: {
    show: true,
    name: "SONAM WANGCHUK",
    /** Day 1 of the indefinite fast. The banner computes the running day count. */
    since: "2026-06-28",
    note: "hospitalised · still fasting",
  },
  /** Circular rubber seal at the band's bottom-right: `center` sits big in
   *  the middle (split on spaces into lines), `rim` runs around the ring. */
  stamp: { center: "BAN NEET", rim: "WHAT IS DEMOCRACY?" },
  hashtag: "#ResignDharmendraPradhan",
  link: {
    label: "FOLLOW THE MOVEMENT",
    href: "https://en.wikipedia.org/wiki/2026_Delhi_Jantar_Mantar_protests",
  },
  signature: "— Dinesh G",
};
