/* Node builders for the Pictionary scene: everything is made with
   createElement and textContent, so no copy string or number ever passes
   through an HTML parser. */

const SVG_NS = "http://www.w3.org/2000/svg";

/** An HTML element with a class and its children. */
export function el<K extends keyof HTMLElementTagNameMap>(
   tag: K,
   className: string,
   ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
   const node = document.createElement(tag);
   if (className) node.className = className;
   node.append(...children);
   return node;
}

/** An SVG element with its attributes and children. */
export function svg<K extends keyof SVGElementTagNameMap>(
   tag: K,
   attrs: Record<string, string | number> = {},
   ...children: Node[]
): SVGElementTagNameMap[K] {
   const node = document.createElementNS(SVG_NS, tag);
   for (const [name, value] of Object.entries(attrs))
      node.setAttribute(name, String(value));
   node.append(...children);
   return node;
}

/** Marks a decorative node so assistive tech skips it. */
export function decor<T extends Element>(node: T): T {
   node.setAttribute("aria-hidden", "true");
   return node;
}

/** A real button; `label` is its accessible name when it has no text. */
export function button(
   className: string,
   label: string | null,
   ...children: (Node | string)[]
): HTMLButtonElement {
   const node = el("button", className, ...children);
   node.type = "button";
   if (label !== null) node.setAttribute("aria-label", label);
   return node;
}
