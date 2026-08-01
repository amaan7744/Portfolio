// A minimal, dependency-free replacement for react-helmet-async.
//
// During the build-time prerender pass (scripts/prerender.mjs), each route
// is rendered once, synchronously, in a single-threaded Node script — so a
// module-level variable is a safe, simple way to capture "what head tags
// did this page ask for" without pulling in a library that (as of this
// writing) has SSR issues under React 19.
let currentHead = null;

export function setHead(head) {
  currentHead = head;
}

export function getHead() {
  return currentHead;
}
