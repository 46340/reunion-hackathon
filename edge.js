/* iOS 26 Safari ignores theme-color: it tints the status bar and the bottom toolbar from fixed elements that touch the screen
   edges, else from the page background, which left light bands over the red hero and under the dark footer (user, 2026-10-16).
   Two strips at the edges carry the colour of whatever is under them, so the page runs edge to edge. WebKit's rules
   (LocalFrameView::fixedContainerEdges): it hit-tests 4 px inside each edge, and a fixed element counts only if it is over 10 px
   tall, at least 90% of the viewport wide and at least 0.1 opaque; its background-color is then read from the style.
   So: 12 px of padding, full width, and the background clipped to the empty content box: Safari reads the colour,
   the screen shows nothing. */
(() => {
  const strips = ["top", "bottom"].map((side) => {
    const d = document.createElement("div");
    d.setAttribute("aria-hidden", "true");
    d.style.cssText = `position:fixed;left:0;right:0;${side}:0;height:0;padding-top:12px;background-clip:content-box;z-index:39;pointer-events:none`;
    document.body.append(d);
    return d;
  });
  const colourAt = (y) => {   // the first opaque background under the middle of that edge (the strips let clicks and hit tests through)
    const hit = document.elementFromPoint(innerWidth / 2, y);
    if (hit && hit.matches("iframe.board")) return "rgb(18, 17, 16)";   // a split-flap board: its black housing, not the section behind it
    for (let e = hit; e; e = e.parentElement) {
      const c = getComputedStyle(e).backgroundColor;
      if (c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return c;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  let queued = false;
  const paint = () => { queued = false; strips[0].style.backgroundColor = colourAt(4); strips[1].style.backgroundColor = colourAt(innerHeight - 5); };   // where Safari looks
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  ["scroll", "resize", "transitionend", "animationend"].forEach((ev) => addEventListener(ev, queue, { passive: true }));   // transitions: the sticky bar sliding in
  new MutationObserver(queue).observe(document.body, { childList: true });   // the intro overlay leaving
  queue();
})();
