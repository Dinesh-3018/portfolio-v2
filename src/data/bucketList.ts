export interface BucketItem {
  text: string;
  done: boolean;
}

/**
 * Dinesh's bucket list for the /desk drawer — his own, in his order (nearer,
 * homelier things first; the big dreams after). `done: true` earns a red DONE
 * stamp on the index card; nothing's ticked yet — that's the point.
 */
export const bucketList: BucketItem[] = [
  { text: "Finally learn to drive — properly", done: false },
  { text: "Buy my first car", done: false },
  { text: "Wander Goa — the warm-up before the far-off trips", done: false },
  { text: "Arupadai Veedu: darshan at all six Murugan temples", done: false },
  { text: "Get to Dubai — and skydive over it if the nerve holds", done: false },
  { text: "Backpack New Zealand and go island-hopping, Backpacker-Kumar style", done: false },
  { text: "Build a real product with my boys", done: false },
  { text: "Build a home for Amma and Appa", done: false },
  { text: "A proposal in Paris — whenever she turns up in my life", done: false },
];

export default bucketList;
