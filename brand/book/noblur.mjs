// Preview, PDFKit and some print RIPs draw Chrome's blurred box/text shadows (luminosity soft masks) as grey boxes.
// Print files drop only the blurred layers; hard layers (the extruded letters, inset borders) and CSS filters stay.
export const stripBlurredShadows = () => {
  const layers = (v) => (v === "none" ? [] : v.split(/,(?![^(]*\))/));
  const blurred = (s) => parseFloat((s.match(/-?[\d.]+px/g) || [])[2] || 0) > 0;
  let n = 0;
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    for (const prop of ["boxShadow", "textShadow"]) {
      const all = layers(cs[prop]), keep = all.filter((s) => !blurred(s));
      if (keep.length !== all.length) { el.style.setProperty(prop === "boxShadow" ? "box-shadow" : "text-shadow", keep.join(",") || "none", "important"); n++; }
    }
  }
  return n;
};
