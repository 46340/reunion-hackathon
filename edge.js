/* iOS 26 Safari ignores theme-color: it tints the status bar and the bottom toolbar from fixed elements that touch the screen
   edges, else from the page background, which left light bands over the red hero and under the dark footer (user, 2026-10-16).
   Two 1 px strips at the edges carry the colour of whatever is under them, so the page runs edge to edge. Elsewhere they are
   invisible: same colour as the content below. */
(() => {
  const strips = ["top", "bottom"].map((side) => {
    const d = document.createElement("div");
    d.setAttribute("aria-hidden", "true");
    d.style.cssText = `position:fixed;left:0;right:0;${side}:0;height:1px;z-index:39;pointer-events:none`;
    document.body.append(d);
    return d;
  });
  const colourAt = (y) => {   // the first opaque background under the middle of that edge (the strips let clicks and hit tests through)
    for (let e = document.elementFromPoint(innerWidth / 2, y); e; e = e.parentElement) {
      const c = getComputedStyle(e).backgroundColor;
      if (c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  let queued = false;
  const paint = () => { queued = false; strips[0].style.background = colourAt(2); strips[1].style.background = colourAt(innerHeight - 3); };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  ["scroll", "resize", "transitionend", "animationend"].forEach((ev) => addEventListener(ev, queue, { passive: true }));   // transitions: the sticky bar sliding in
  new MutationObserver(queue).observe(document.body, { childList: true });   // the intro overlay leaving
  queue();
})();
