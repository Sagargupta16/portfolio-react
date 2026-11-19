/* The street's crowd, drawn in code as flat cut-paper silhouettes. Ported
   from the footer lab's rush-hour-night/people.js.

   Every figure is drawn once into a strip of walk frames inside one static
   SVG. The street moves that strip with a steps() transform on an HTML
   element, so nothing inside an SVG ever animates.

   Units inside the generator are fractions of the figure height, y up. */

import type { Look, StripBox, StripSpec } from "./score";

type V = readonly [number, number];

const rad = (d: number): number => (d * Math.PI) / 180;
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const lerp = (a: V, b: V, t: number): V => [
   a[0] + (b[0] - a[0]) * t,
   a[1] + (b[1] - a[1]) * t,
];
// A limb hanging at angle a (radians, forward positive).
const dir = (a: number): V => [Math.sin(a), -Math.cos(a)];
const rot = (v: V, a: number): V => [
   v[0] * Math.cos(a) - v[1] * Math.sin(a),
   v[0] * Math.sin(a) + v[1] * Math.cos(a),
];
const norm = (a: V, b: V): V => {
   const d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
   return [(a[0] - b[0]) / d, (a[1] - b[1]) / d];
};

// Periodic keyframe curve, cosine-eased between keys (p in [0, 1)).
const curve =
   (keys: readonly (readonly [number, number])[]) =>
   (phase: number): number => {
      const p = phase - Math.floor(phase);
      for (let i = 1; i < keys.length; i++) {
         const k0 = keys[i - 1];
         const k1 = keys[i];
         if (!k0 || !k1 || p > k1[0]) continue;
         const t = (p - k0[0]) / (k1[0] - k0[0] || 1);
         return k0[1] + (k1[1] - k0[1]) * (0.5 - 0.5 * Math.cos(Math.PI * t));
      }
      return keys[0]?.[1] ?? 0;
   };
// A walk cycle for the near-side leg; p = 0 is heel strike.
const THIGH = curve([
   [0, 24],
   [0.15, 20],
   [0.5, -15],
   [0.62, -7],
   [0.85, 28],
   [1, 24],
]);
const KNEE = curve([
   [0, 4],
   [0.12, 15],
   [0.4, 4],
   [0.6, 36],
   [0.73, 64],
   [0.88, 24],
   [1, 4],
]);
const FOOT = curve([
   [0, 14],
   [0.08, 0],
   [0.42, 0],
   [0.6, -32],
   [0.72, -16],
   [0.88, 4],
   [1, 14],
]);

// Two-link IK: joint position for root R, target T, bone lengths l1, l2.
const ik = (R: V, T: V, l1: number, l2: number, bend: number): V => {
   const dx = T[0] - R[0];
   const dy = T[1] - R[1];
   const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 1e-4);
   const a = Math.atan2(dy, dx);
   const b = Math.acos(
      Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))),
   );
   const ang = a + bend * b;
   return [R[0] + Math.cos(ang) * l1, R[1] + Math.sin(ang) * l1];
};

/* ---------- path pieces (screen space, px, y down) ---------- */
const f1 = (n: number): number => Math.round(n * 10) / 10;
const circ = (c: V, r: number): string =>
   `M${f1(c[0] - r)} ${f1(c[1])}a${f1(r)} ${f1(r)} 0 1 1 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 1 ${f1(-2 * r)} 0Z`;
// Signed area: every closed piece is wound the same way, so pieces that
// overlap fill as one shape.
const area = (pts: readonly V[]): number => {
   let sum = 0;
   pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length] ?? a;
      sum += a[0] * b[1] - b[0] * a[1];
   });
   return sum;
};
const wound = (pts: readonly V[]): V[] =>
   area(pts) < 0 ? [...pts].reverse() : [...pts];
const poly = (pts: readonly V[]): string =>
   `M${wound(pts)
      .map((q) => `${f1(q[0])} ${f1(q[1])}`)
      .join("L")}Z`;
// A tapered limb: two circles joined by their outer tangents.
const capsule = (c1: V, r1: number, c2: V, r2: number): string => {
   const dx = c2[0] - c1[0];
   const dy = c2[1] - c1[1];
   const d = Math.hypot(dx, dy);
   let out = circ(c1, r1) + circ(c2, r2);
   if (d > Math.abs(r1 - r2) + 0.01) {
      const u: V = [dx / d, dy / d];
      const n: V = [-u[1], u[0]];
      const s = (r1 - r2) / d;
      const c = Math.sqrt(1 - s * s);
      const m1: V = [s * u[0] + c * n[0], s * u[1] + c * n[1]];
      const m2: V = [s * u[0] - c * n[0], s * u[1] - c * n[1]];
      out += poly([
         add(c1, mul(m1, r1)),
         add(c2, mul(m1, r2)),
         add(c2, mul(m2, r2)),
         add(c1, mul(m2, r1)),
      ]);
   }
   return out;
};

interface Line {
   w: number;
   d: string;
}
// "lit": a softly lit window (a gradient, no rim); "plain": the body colour
// with no rim (a head seen against a lit window)
type Paint = "" | "lit" | "plain";
interface Layer {
   back: boolean;
   cut: boolean;
   paint: Paint;
   fill: string[];
   lines: Line[];
}
interface ToPx {
   /** px per figure height */
   k: number;
   p(q: V): V;
}

/* One frame is a list of layers drawn back to front. Each layer holds
   filled subpaths and stroked lines; "back" layers use the darker tone. */
class Frame {
   readonly layers = new Map<string, Layer>();
   private cur: Layer | null = null;
   constructor(private readonly toPx: ToPx) {}
   private get on(): Layer {
      return this.cur ?? this.open("base", false, false, "");
   }
   // A name used twice in one frame is one layer, as across frames.
   private open(name: string, back: boolean, cut: boolean, paint: Paint) {
      const l: Layer = this.layers.get(name) ?? {
         back,
         cut,
         paint,
         fill: [],
         lines: [],
      };
      this.layers.set(name, l);
      this.cur = l;
      return l;
   }
   // cut: a cut-paper break, drawn in the cut colour of the tone, no rim
   layer(name: string, back = false, cut = false, paint: Paint = ""): this {
      this.open(name, back, cut, paint);
      return this;
   }
   cap(a: V, ra: number, b: V, rb: number): this {
      const s = this.toPx;
      this.on.fill.push(capsule(s.p(a), ra * s.k, s.p(b), rb * s.k));
      return this;
   }
   dot(c: V, r: number): this {
      this.on.fill.push(circ(this.toPx.p(c), r * this.toPx.k));
      return this;
   }
   shape(pts: readonly V[]): this {
      this.on.fill.push(poly(pts.map((q) => this.toPx.p(q))));
      return this;
   }
   // A closed Catmull-Rom curve through pts (k < 1 keeps corners firmer).
   smooth(pts: readonly V[], k = 1): this {
      const q = wound(pts.map((v) => this.toPx.p(v)));
      const n = q.length;
      const pt = (i: number): V => q[(i + n) % n] ?? [0, 0];
      let d = `M${f1(pt(0)[0])} ${f1(pt(0)[1])}`;
      for (let i = 0; i < n; i++) {
         const p0 = pt(i - 1);
         const p1 = pt(i);
         const p2 = pt(i + 1);
         const p3 = pt(i + 2);
         const c1: V = [
            p1[0] + ((p2[0] - p0[0]) * k) / 6,
            p1[1] + ((p2[1] - p0[1]) * k) / 6,
         ];
         const c2: V = [
            p2[0] - ((p3[0] - p1[0]) * k) / 6,
            p2[1] - ((p3[1] - p1[1]) * k) / 6,
         ];
         d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
      }
      this.on.fill.push(`${d}Z`);
      return this;
   }
   line(pts: readonly V[], w: number): this {
      const s = this.toPx;
      const d = `M${pts
         .map((q) => s.p(q))
         .map((q) => `${f1(q[0])} ${f1(q[1])}`)
         .join("L")}`;
      this.on.lines.push({ w: Math.max(0.9, w * s.k), d });
      return this;
   }
   // a straight break across a limb or body at p, perpendicular to
   // direction d, r to each side
   across(p: V, d: V, r: number, w: number): this {
      const n: V = [-d[1], d[0]];
      return this.line([add(p, mul(n, r)), add(p, mul(n, -r))], w);
   }
   ring(c: V, r: number, w: number): this {
      const s = this.toPx;
      this.on.lines.push({
         w: Math.max(0.9, w * s.k),
         d: circ(s.p(c), r * s.k),
      });
      return this;
   }
}

/* ---------- the crowd ---------- */
// Body plans and what each person wears and carries: a mixed, modern city
// crowd.
interface Wear {
   hair: "short" | "knot" | "ponytail" | "cap" | "long";
   arm: "swing" | "cup" | "umbrella" | "call" | "hold";
   pack?: boolean;
   hood?: boolean;
   phones?: boolean;
   tote?: boolean;
   coat?: boolean;
   strap?: boolean;
   belly?: boolean;
   skirt?: boolean;
   kid?: boolean;
   stride?: number;
   hipW?: number;
   shoulderW?: number;
}
const LOOKS: Record<Look, Wear> = {
   pack: { hair: "short", pack: true, arm: "swing" },
   // a hooded top with the hood down, a backpack and over-ear headphones
   headphones: {
      hair: "short",
      hood: true,
      pack: true,
      phones: true,
      arm: "swing",
      shoulderW: 1.04,
   },
   tote: {
      hair: "knot",
      tote: true,
      coat: true,
      hipW: 1.06,
      shoulderW: 0.9,
      arm: "swing",
   },
   // a sling bag and a takeaway cup carried in front
   cup: {
      hair: "ponytail",
      arm: "cup",
      strap: true,
      hipW: 1.04,
      shoulderW: 0.94,
   },
   umbrella: {
      hair: "short",
      arm: "umbrella",
      belly: true,
      stride: 0.85,
      coat: true,
   },
   commuter: { hair: "cap", pack: true, arm: "swing", shoulderW: 1.08 },
   // on a call, the phone at the ear
   call: { hair: "short", arm: "call", coat: true },
   longhair: {
      hair: "long",
      arm: "swing",
      skirt: true,
      hipW: 1.04,
      shoulderW: 0.9,
   },
   parent: {
      hair: "knot",
      arm: "hold",
      kid: true,
      hipW: 1.05,
      shoulderW: 0.92,
      coat: true,
   },
};
const CHILD: Wear = { hair: "short", arm: "swing", stride: 1.05 };

interface Bones {
   thigh: number;
   shin: number;
   upper: number;
   fore: number;
   torso: number;
   neck: number;
   headR: number;
   foot: number;
}
const SK: Bones = {
   thigh: 0.245,
   shin: 0.235,
   upper: 0.17,
   fore: 0.15,
   torso: 0.285,
   neck: 0.035,
   headR: 0.064,
   foot: 1,
};

interface Leg {
   hip: V;
   knee: V;
   ankle: V;
   heel: V;
   toe: V;
   k: number;
}
// Leg forward kinematics from the hip, phase p, stride amplitude.
const legAt = (hip: V, p: number, stride: number, sk: Bones): Leg => {
   const a1 = rad(THIGH(p) * stride);
   const knee = add(hip, mul(dir(a1), sk.thigh));
   const a2 = a1 - rad(KNEE(p) * (0.75 + 0.25 * stride));
   const ankle = add(knee, mul(dir(a2), sk.shin));
   const f = rad(FOOT(p));
   const heel = add(ankle, mul(rot([-0.028, -0.024], f), sk.foot));
   const toe = add(ankle, mul(rot([0.105, -0.03], f), sk.foot));
   return { hip, knee, ankle, heel, toe, k: sk.foot };
};
const footLow = (l: Leg): number =>
   Math.min(l.heel[1] - 0.026 * l.k, l.toe[1] - 0.019 * l.k);

// A leg in trousers: thigh, shin with a calf, a hem, a shoe.
const drawLeg = (F: Frame, l: Leg, w: number, hem: boolean): void => {
   const s = norm(l.ankle, l.knee);
   const backward = rot(s, -Math.PI / 2);
   F.cap(l.hip, 0.06 * w, l.knee, 0.036 * w)
      .cap(l.knee, 0.034 * w, l.ankle, 0.021 * w)
      .dot(
         add(lerp(l.knee, l.ankle, 0.3), mul(backward, 0.007 * w)),
         0.034 * w,
      );
   if (hem) F.dot(add(l.ankle, mul(s, 0.012 * w)), 0.026 * w);
   F.cap(add(l.heel, mul(s, 0.002)), 0.027 * w, l.toe, 0.02 * w);
};
// An arm: shoulder with the deltoid, forearm, a mitten hand.
const drawArm = (F: Frame, sh: V, el: V, wr: V, w: number): void => {
   const d = norm(wr, el);
   F.cap(sh, 0.042 * w, el, 0.027 * w)
      .cap(el, 0.026 * w, wr, 0.019 * w)
      .cap(wr, 0.02 * w, add(wr, mul(d, 0.05 * w)), 0.015 * w);
};

interface PersonOptions {
   kid?: boolean;
   tag?: string;
   lean?: number;
   wave?: boolean;
   /** The far hand reaches this point (a child holding on). */
   reachTo?: V;
   /** The near hand is held at this point (a parent holding a child). */
   holdAt?: V;
}

/* A walking person at phase p, drawn into frame F.
   origin: [x, 0] ground point in figure units; scale: 1 for adults. */
function person(
   F: Frame,
   p: number,
   wear: Wear,
   origin: V,
   scale: number,
   opts: PersonOptions,
): void {
   const kid = opts.kid === true;
   const sk: Bones = {
      thigh: SK.thigh * scale,
      shin: SK.shin * scale,
      upper: SK.upper * scale,
      fore: SK.fore * scale,
      torso: SK.torso * scale * (kid ? 0.9 : 1),
      neck: SK.neck * scale,
      headR: SK.headR * scale * (kid ? 1.3 : 1),
      foot: SK.foot * scale,
   };
   const stride = wear.stride ?? 1;
   const w = scale * (kid ? 1.12 : 1);
   // Hip height that keeps the lower foot on the ground (the bob).
   const L0 = legAt([0, 0], p, stride, sk);
   const L1 = legAt([0, 0], p + 0.5, stride, sk);
   const hip: V = [origin[0], -Math.min(footLow(L0), footLow(L1))];
   const near = legAt(hip, p, stride, sk);
   const far = legAt(hip, p + 0.5, stride, sk);
   const lean = rad(opts.lean ?? 4);
   const u: V = [Math.sin(lean), Math.cos(lean)]; // up the spine
   const f: V = [Math.cos(lean), -Math.sin(lean)]; // forward
   const T = sk.torso / scale;
   const at = (a: number, b: number): V =>
      add(hip, add(mul(u, a * scale), mul(f, b * scale)));
   const sh = at(T, 0);
   const hr = sk.headR;
   const headC = add(sh, [0.022 * scale, sk.neck + hr * 0.95]);
   const hw = wear.hipW ?? 1;
   const sw = wear.shoulderW ?? 1;

   // Arm angles: swing opposite to the legs.
   const swing = (q: number, amp: number): [number, number] => [
      rad(-amp * Math.cos(2 * Math.PI * q)),
      rad(12 + 20 * (0.5 - 0.5 * Math.cos(2 * Math.PI * (q - 0.5)))),
   ];
   const armFK = (s: V, a: number, e: number): [V, V] => {
      const el = add(s, mul(dir(a), sk.upper));
      return [el, add(el, mul(dir(a + e), sk.fore))];
   };
   const shF = at(T - 0.03, -0.012);
   const shN = at(T - 0.032, 0.004);
   const amp = (kid ? 16 : 20) * stride;
   let farArm: [V, V];
   if (opts.reachTo)
      farArm = [ik(shF, opts.reachTo, sk.upper, sk.fore, 1), opts.reachTo];
   else {
      const [a, e] = swing(p, amp * (wear.arm === "swing" ? 1 : 0.85));
      farArm = armFK(shF, a, e);
   }
   let nearArm: [V, V];
   let carry: "" | "palm" | "umbrella" | "phone" | "cup" = "";
   if (opts.wave) {
      // a hand raised at him: the upper arm out and up in front of her, the
      // elbow bent so the forearm stands upright clear of her head (a gap of
      // lit window between them), an open palm on top. Only the forearm
      // sways, twice a stride.
      const a = rad(118);
      const fa = rad(175 + 9 * Math.sin(2 * Math.PI * p * 2));
      nearArm = armFK(shN, a, fa - a);
      carry = "palm";
   } else if (wear.arm === "umbrella") {
      const [a, e] = swing(p + 0.5, amp * 0.75);
      nearArm = armFK(shN, a, e * 0.6);
      carry = "umbrella";
   } else if (wear.arm === "hold") {
      const holdAt = opts.holdAt ?? add(shN, mul(dir(0), sk.upper + sk.fore));
      nearArm = [ik(shN, holdAt, sk.upper, sk.fore, -1), holdAt];
   } else if (wear.arm === "call") {
      // on a call: the elbow down and forward, the hand at the jaw
      const el = add(
         shN,
         mul(dir(rad(52 + 3 * Math.sin(2 * Math.PI * p))), sk.upper),
      );
      const ear = add(headC, [0.012 * scale, -0.018 * scale]);
      nearArm = [el, add(el, mul(norm(ear, el), sk.fore))];
      carry = "phone";
   } else if (wear.arm === "cup") {
      // a takeaway cup carried in front: the forearm level, a little sway
      const [a] = swing(p + 0.5, 6);
      const el = add(shN, mul(dir(a + rad(6)), sk.upper));
      nearArm = [el, add(el, mul(dir(rad(78)), sk.fore))];
      carry = "cup";
   } else {
      const [a, e] = swing(p + 0.5, amp * (wear.tote ? 0.4 : 1));
      nearArm = armFK(shN, a, e);
   }

   const tag = opts.tag ?? "";
   const trousers = !wear.skirt;
   // back layer: far arm and far leg, in the darker tone
   F.layer(`${tag}b`, true);
   drawArm(F, shF, farArm[0], farArm[1], w);
   drawLeg(F, far, w, trousers && !kid);
   if (wear.pack) {
      F.layer(`${tag}p`);
      F.cap(
         at(T - 0.03, -0.112),
         0.056 * scale,
         at(T * 0.36, -0.122),
         0.064 * scale,
      );
   }
   if (wear.hair === "long") {
      F.layer(`${tag}h`);
      F.cap(
         add(headC, [-hr * 0.35, hr * 0.45]),
         hr * 0.98,
         at(T - 0.07, -0.05),
         hr * 0.8,
      );
   }
   // body: torso in its clothes, neck, head, hair
   F.layer(`${tag}m`);
   const hem = wear.coat ? 0.15 : 0.045;
   const flare = wear.coat ? 0.012 : 0;
   const sway = 0.01 * Math.sin(2 * Math.PI * p);
   F.smooth([
      at(T + 0.014, 0.004),
      at(T * 0.92, 0.062 * sw),
      at(T * 0.68, (0.084 + (kid ? -0.012 : 0)) * sw),
      at(T * 0.38, 0.066),
      at(0.03, 0.07 * hw),
      at(-hem, (0.072 + flare) * hw + sway),
      at(-hem - 0.004, 0.0),
      at(-hem, (-0.076 - flare) * hw + sway),
      at(0.05, -0.078 * hw),
      at(T * 0.42, -0.064),
      at(T * 0.8, -0.076 * sw),
      at(T + 0.006, -0.042),
   ]);
   if (wear.belly) F.dot(at(T * 0.36, 0.03), 0.07 * scale);
   if (wear.skirt) {
      F.smooth([
         at(0.06, 0.066 * hw),
         at(-0.22, 0.11 + sway),
         at(-0.235, 0),
         at(-0.22, -0.1 + sway),
         at(0.06, -0.07 * hw),
      ]);
   }
   F.cap(
      at(T - 0.01, 0.002),
      0.027 * scale,
      add(headC, [-0.012 * scale, -0.03 * scale]),
      0.025 * scale,
   );
   F.dot(headC, hr);
   F.dot(add(headC, [0.017 * scale, -0.024 * scale]), hr * 0.78); // jaw
   // hair volume
   if (wear.hair !== "cap")
      F.dot(add(headC, [-0.012 * scale, 0.012 * scale]), hr * 0.98);
   if (wear.hair === "knot")
      F.dot(add(headC, [-hr * 1.0, hr * 0.5]), hr * 0.48);
   if (wear.hair === "ponytail") {
      const t = 0.014 * scale * Math.sin(2 * Math.PI * p * 2);
      F.cap(
         add(headC, [-hr * 0.9, hr * 0.4]),
         hr * 0.32,
         add(headC, [-hr * 1.6 + t, -hr * 0.85]),
         hr * 0.2,
      );
   }
   if (wear.hair === "cap") {
      F.dot(add(headC, [-0.004 * scale, hr * 0.16]), hr * 1.03);
      F.cap(
         add(headC, [hr * 0.6, hr * 0.44]),
         hr * 0.22,
         add(headC, [hr * 1.65, hr * 0.3]),
         hr * 0.12,
      );
   }
   // a hood, down: a soft roll behind the neck
   if (wear.hood)
      F.cap(
         at(T + 0.012, -0.05),
         0.034 * scale,
         add(headC, [-hr * 0.82, -hr * 0.5]),
         0.03 * scale,
      );
   // over-ear headphones: the band stands just off the crown
   if (wear.phones) {
      const c = add(headC, [-0.006 * scale, 0.004 * scale]);
      const R = hr * 1.24;
      const arc: V[] = [];
      for (let k = 0; k <= 8; k++) {
         const a = rad(20 + (k * 140) / 8);
         arc.push(add(c, [Math.cos(a) * R, Math.sin(a) * R]));
      }
      F.layer(`${tag}hp`);
      F.line(arc, hr * 0.2);
      F.dot(add(headC, [-hr * 0.16, -hr * 0.08]), hr * 0.46);
   }
   // cut-paper breaks, so a body is pieces of paper, not one tube:
   // a belt, the seam where a backpack meets the back, the front edge of a
   // coat
   const cw = 0.0055 * scale;
   if (!kid) {
      F.layer(`${tag}c1`, false, true);
      if (!wear.coat)
         F.line([at(0.075, -0.071 * hw), at(0.075, 0.066 * hw)], cw);
      if (wear.pack) F.line([at(T - 0.045, -0.069), at(T * 0.42, -0.07)], cw);
      if (wear.coat)
         F.line([at(T * 0.62, 0.075), at(-hem + 0.01, 0.07 + flare)], cw);
      // where the hood meets the neck
      if (wear.hood)
         F.line(
            [add(headC, [-hr * 0.5, -hr * 0.98]), at(T + 0.002, -0.02)],
            cw,
         );
      // the ear cup
      if (wear.phones)
         F.ring(add(headC, [-hr * 0.16, -hr * 0.08]), hr * 0.3, cw);
   }
   // near leg, then what hangs at the hip, then the near arm
   F.layer(`${tag}f`);
   drawLeg(F, near, w, trousers && !kid);
   if (!kid && trousers && !wear.coat) {
      F.layer(`${tag}c2`, false, true);
      // trouser cuff
      F.across(
         lerp(near.knee, near.ankle, 0.8),
         norm(near.ankle, near.knee),
         0.022 * w,
         cw,
      );
   }
   if (wear.tote) {
      F.layer(`${tag}g`);
      const top = at(0.06, -0.035);
      F.line([at(T - 0.03, 0.02), add(top, [0.03 * scale, 0])], 0.012 * scale);
      F.smooth(
         [
            add(top, [-0.04 * scale, 0]),
            add(top, [0.085 * scale, 0]),
            add(top, [0.105 * scale, -0.16 * scale]),
            add(top, [-0.06 * scale, -0.16 * scale]),
         ],
         0.25,
      );
   }
   if (wear.strap) {
      // a sling bag: strap across the chest, the bag on the back hip
      F.layer(`${tag}g`);
      F.line([at(T + 0.004, 0.035), at(0.1, -0.05)], 0.016 * scale);
      F.smooth(
         [at(0.16, -0.05), at(0.16, -0.135), at(0.03, -0.14), at(0.03, -0.055)],
         0.35,
      );
      F.layer(`${tag}cg`, false, true);
      F.line([at(T - 0.012, 0.046), at(0.12, -0.034)], cw); // the gap beside the strap
      F.line([at(0.135, -0.055), at(0.135, -0.13)], cw); // the flap of the bag
   }
   F.layer(`${tag}a`);
   const [el, wr] = nearArm;
   if (carry === "palm") {
      // upper arm and forearm, then an open palm a little wider than the
      // wrist, the thumb splayed forward so a notch shows at its root
      const d = norm(wr, el);
      const n = rot(d, -Math.PI / 2); // forward, away from her head
      F.cap(shN, 0.042 * w, el, 0.027 * w)
         .cap(el, 0.026 * w, wr, 0.019 * w)
         .cap(
            add(wr, mul(d, 0.01 * w)),
            0.021 * w,
            add(wr, mul(d, 0.052 * w)),
            0.023 * w,
         )
         .cap(
            add(wr, add(mul(d, 0.012 * w), mul(n, 0.012 * w))),
            0.01 * w,
            add(wr, add(mul(d, 0.034 * w), mul(n, 0.047 * w))),
            0.008 * w,
         );
   } else drawArm(F, shN, el, wr, w);
   if (!kid) {
      // a sleeve hem on the near arm (a coat gets a cuff at the wrist)
      F.layer(`${tag}c3`, false, true);
      if (wear.coat) F.across(lerp(el, wr, 0.78), norm(wr, el), 0.0215 * w, cw);
      else F.across(lerp(shN, el, 0.6), norm(el, shN), 0.031 * w, cw);
      F.layer(`${tag}a2`);
   }
   if (carry === "umbrella") {
      const a = Math.atan2(wr[1] - el[1], wr[0] - el[0]);
      const d = dir(rad(28) + (a + Math.PI / 2) * 0.35);
      const tip = add(wr, mul(d, 0.42 * scale));
      const mid = add(wr, mul(d, 0.2 * scale));
      const n: V = [-d[1], d[0]];
      F.shape([
         add(wr, mul(n, 0.012 * scale)),
         add(mid, mul(n, 0.032 * scale)),
         add(tip, mul(d, -0.06 * scale)),
         add(mid, mul(n, -0.032 * scale)),
         add(wr, mul(n, -0.012 * scale)),
      ]);
      F.line([wr, tip], 0.008 * scale);
   }
   if (carry === "cup") {
      // a takeaway cup held upright: tapered, a lid, the sleeve
      const b = add(wr, [0.03 * scale, -0.02 * scale]);
      const k = scale;
      F.shape([
         add(b, [-0.015 * k, 0]),
         add(b, [0.015 * k, 0]),
         add(b, [0.021 * k, 0.07 * k]),
         add(b, [-0.021 * k, 0.07 * k]),
      ]);
      F.shape([
         add(b, [-0.025 * k, 0.07 * k]),
         add(b, [0.025 * k, 0.07 * k]),
         add(b, [0.022 * k, 0.083 * k]),
         add(b, [-0.022 * k, 0.083 * k]),
      ]);
      F.layer(`${tag}cc`, false, true);
      F.line(
         [add(b, [-0.022 * k, 0.07 * k]), add(b, [0.022 * k, 0.07 * k])],
         cw,
      );
      F.line(
         [add(b, [-0.018 * k, 0.022 * k]), add(b, [0.018 * k, 0.022 * k])],
         cw,
      );
   }
}

/* ---------- frames for each kind ---------- */
type Draw = (F: Frame, i: number) => void;

function walkerFrames(spec: StripSpec, N: number): Draw {
   const wear = LOOKS[spec.look ?? "pack"];
   return (F, i) => {
      const p = i / N;
      if (wear.kid) {
         // parent on the far side, a child on the near side holding hands:
         // the raised hand of the child meets the lowered hand of the parent
         const holdAt: V = [0.11, 0.53];
         person(F, p, wear, [0, 0], 1, { holdAt });
         person(F, (p * 2 + 0.25) % 1, CHILD, [0.21, 0], 0.56, {
            kid: true,
            tag: "k",
            lean: 2,
            reachTo: holdAt,
         });
      } else person(F, p, wear, [0, 0], 1, { wave: spec.wave === true });
   };
}

function cyclistFrames(N: number): Draw {
   // Units: rider height = 1.
   const R = 0.2;
   const rear: V = [-0.3, R];
   const front: V = [0.31, R];
   const bb: V = [-0.02, 0.16];
   const seat: V = [-0.13, 0.57];
   const bar: V = [0.21, 0.6];
   return (F, i) => {
      const ang = 2 * Math.PI * (i / N);
      const crank = 0.075;
      // wheels and frame: thin lines, back layer first
      const spokes = (c: V, a0: number): [V, V][] => {
         const out: [V, V][] = [];
         for (let k = 0; k < 3; k++) {
            const a = a0 + (k * Math.PI) / 3;
            const reach: V = [Math.cos(a) * R * 0.92, Math.sin(a) * R * 0.92];
            out.push([add(c, reach), add(c, mul(reach, -1))]);
         }
         return out;
      };
      const spin = -ang * 2.6;
      F.layer("w", true);
      F.ring(rear, R * 0.97, 0.026).ring(front, R * 0.97, 0.026);
      for (const s of [...spokes(rear, spin), ...spokes(front, spin + 0.4)])
         F.line(s, 0.006);
      F.dot(rear, 0.018).dot(front, 0.018);
      // far pedal leg
      const hip = add(seat, [0.01, 0.035]);
      const pedalF = add(bb, [
         Math.cos(ang + Math.PI) * crank,
         Math.sin(ang + Math.PI) * crank,
      ]);
      const pedalN = add(bb, [Math.cos(ang) * crank, Math.sin(ang) * crank]);
      const legTo = (pd: V): { knee: V; ankle: V } => {
         const ankle = add(pd, [-0.025, 0.035]);
         return { knee: ik(hip, ankle, SK.thigh, SK.shin, 1), ankle };
      };
      F.layer("b", true);
      const lf = legTo(pedalF);
      F.cap(hip, 0.048, lf.knee, 0.033)
         .cap(lf.knee, 0.032, lf.ankle, 0.022)
         .cap(
            add(pedalF, [-0.04, 0.01]),
            0.022,
            add(pedalF, [0.06, 0.004]),
            0.016,
         );
      const sh = add(hip, mul([Math.sin(rad(42)), Math.cos(rad(42))], 0.29));
      const elF = ik(add(sh, [-0.01, -0.02]), bar, SK.upper, SK.fore, -1);
      F.cap(add(sh, [-0.01, -0.02]), 0.028, elF, 0.023).cap(
         elF,
         0.022,
         bar,
         0.018,
      );
      F.layer("fr");
      F.line([rear, bb, seat, rear], 0.022)
         .line([seat, add(bar, [-0.02, -0.06]), bb], 0.024)
         .line([add(bar, [-0.02, -0.06]), front], 0.022);
      F.line([add(seat, [-0.04, 0.005]), add(seat, [0.04, 0.012])], 0.03);
      F.line([bar, add(bar, [0.04, 0.012])], 0.022);
      F.line([pedalF, pedalN], 0.014);
      // body
      F.layer("m");
      F.cap(add(hip, [0, 0.01]), 0.06, add(sh, [0, -0.03]), 0.056);
      F.dot(lerp(hip, sh, 0.65), 0.06);
      const headC = add(sh, [0.07, 0.085]);
      F.cap(add(sh, [0.01, 0]), 0.026, headC, 0.024);
      F.dot(headC, SK.headR);
      F.dot(add(headC, [0.016, -0.022]), SK.headR * 0.8);
      // a cycle helmet: a long low dome with a short peak
      F.cap(
         add(headC, [-0.022, 0.03]),
         SK.headR * 0.86,
         add(headC, [0.026, 0.034]),
         SK.headR * 0.78,
      );
      F.layer("hc", false, true);
      F.line([add(headC, [-0.07, 0.014]), add(headC, [0.075, 0.022])], 0.006);
      F.layer("f");
      const ln = legTo(pedalN);
      F.cap(hip, 0.05, ln.knee, 0.034)
         .cap(ln.knee, 0.033, ln.ankle, 0.022)
         .cap(
            add(pedalN, [-0.04, 0.01]),
            0.022,
            add(pedalN, [0.06, 0.004]),
            0.016,
         );
      F.layer("a");
      const elN = ik(sh, bar, SK.upper, SK.fore, -1);
      F.cap(sh, 0.03, elN, 0.024).cap(elN, 0.023, bar, 0.018).dot(bar, 0.022);
   };
}

function scooterFrames(N: number): Draw {
   // An e-scooter rider. Units: rider height = 1, facing right; the ground
   // point under the deck. The knees give a little with the road.
   return (F, i) => {
      const give = 0.006 * (0.5 - 0.5 * Math.cos(2 * Math.PI * (i / N)));
      const wr = 0.05;
      const rearW: V = [-0.27, wr];
      const frontW: V = [0.27, wr];
      const deck = 0.085;
      const bar: V = [0.22, 0.6];
      F.layer("w", true);
      F.dot(rearW, wr).dot(frontW, wr);
      // far leg back on the deck, near leg in front; the hip over them
      const hip: V = [-0.03, 0.49 - give];
      const sh = add(hip, [0.03, 0.29]);
      const footB: V = [-0.15, deck + 0.012];
      const footF: V = [0.04, deck + 0.012];
      const legTo = (foot: V): { knee: V; ankle: V } => {
         const ankle = add(foot, [0, 0.03]);
         return { knee: ik(hip, ankle, SK.thigh, SK.shin, 1), ankle };
      };
      F.layer("b", true);
      const lb = legTo(footB);
      F.cap(hip, 0.05, lb.knee, 0.035)
         .cap(lb.knee, 0.034, lb.ankle, 0.022)
         .cap(
            add(footB, [-0.03, 0.006]),
            0.024,
            add(footB, [0.07, 0.002]),
            0.018,
         );
      const elF = ik(add(sh, [-0.01, -0.02]), bar, SK.upper, SK.fore, -1);
      F.cap(add(sh, [-0.01, -0.02]), 0.028, elF, 0.023).cap(
         elF,
         0.022,
         bar,
         0.018,
      );
      // the scooter: deck, stem, bars
      F.layer("fr");
      F.line(
         [
            [-0.29, deck],
            [0.2, deck],
         ],
         0.028,
      );
      F.line([[0.2, deck], frontW], 0.02);
      F.line([frontW, [0.235, 0.36], bar], 0.022);
      F.line([add(bar, [-0.035, 0.006]), add(bar, [0.03, -0.004])], 0.022);
      F.line([[-0.29, deck], rearW], 0.016);
      // body, head and the near leg and arm
      F.layer("m");
      F.cap(add(hip, [0, 0.01]), 0.062, add(sh, [0, -0.03]), 0.058);
      F.dot(lerp(hip, sh, 0.62), 0.064);
      const headC = add(sh, [0.03, 0.1]);
      F.cap(add(sh, [0.01, 0]), 0.026, headC, 0.024);
      F.dot(headC, SK.headR);
      F.dot(add(headC, [0.017, -0.022]), SK.headR * 0.8);
      F.dot(add(headC, [-0.012, 0.012]), SK.headR * 0.98);
      F.layer("f");
      const lf = legTo(footF);
      F.cap(hip, 0.052, lf.knee, 0.036)
         .cap(lf.knee, 0.035, lf.ankle, 0.022)
         .cap(
            add(footF, [-0.03, 0.006]),
            0.024,
            add(footF, [0.07, 0.002]),
            0.018,
         );
      F.layer("a");
      const elN = ik(sh, bar, SK.upper, SK.fore, -1);
      F.cap(sh, 0.03, elN, 0.024).cap(elN, 0.023, bar, 0.018).dot(bar, 0.022);
      F.layer("cs", false, true);
      const belt = lerp(hip, sh, 0.1);
      F.line([add(belt, [0.066, 0]), add(belt, [-0.064, 0])], 0.0055);
   };
}

function busFrames(N: number): Draw {
   // A small electric city bus. Units: roof height = 1, facing right, the
   // ground point at the middle of its length.
   return (F, i) => {
      const p = i / N;
      // it rocks gently on its springs; the wheels stay on the road
      const bob: V = [0, 0.006 * Math.sin(2 * Math.PI * p)];
      const tilt = rad(0.25 * Math.sin(2 * Math.PI * p + 0.8));
      const T = (q: V): V => add(rot(q, tilt), bob);
      const box = (x0: number, y0: number, x1: number, y1: number): V[] =>
         (
            [
               [x0, y0],
               [x1, y0],
               [x1, y1],
               [x0, y1],
            ] as const
         ).map(T);
      const wr = 0.12;
      const rearW: V = [-0.82, wr];
      const frontW: V = [0.86, wr];
      F.layer("w", true);
      F.dot(rearW, wr).dot(frontW, wr);
      // the body, with arches cut round the wheels and a battery pod on the
      // roof
      const arch = (cx: number): V[] => {
         const out: V[] = [];
         for (let k = 0; k <= 6; k++) {
            const a = rad(k * 30);
            out.push([cx + Math.cos(a) * 0.152, 0.13 + Math.sin(a) * 0.135]);
         }
         return out;
      };
      const body: V[] = [
         [-1.27, 0.16],
         [-1.3, 0.28],
         [-1.3, 0.9],
         [-1.26, 0.97],
         [-1.18, 0.995],
         [-0.72, 0.995],
         [-0.68, 1.035],
         [0.3, 1.035],
         [0.34, 0.995],
         [1.08, 0.995],
         [1.2, 0.97],
         [1.28, 0.9],
         [1.33, 0.56],
         [1.35, 0.3],
         [1.33, 0.2],
         [1.27, 0.155],
         ...arch(frontW[0]),
         [-0.62, 0.155],
         ...arch(rearW[0]),
         [-1.05, 0.155],
      ];
      F.layer("m");
      F.shape(body.map(T));
      // softly lit windows: five side panes, the glass doors, the
      // windscreen, and a blank destination strip over it
      F.layer("lit", false, false, "lit");
      for (let k = 0; k < 5; k++) {
         const x0 = -1.2 + k * 0.345;
         F.shape(box(x0, 0.5, x0 + 0.305, 0.86));
      }
      F.shape(box(0.6, 0.24, 0.9, 0.86));
      F.shape(
         (
            [
               [0.98, 0.52],
               [1.3, 0.55],
               [1.255, 0.88],
               [0.98, 0.88],
            ] as const
         ).map(T),
      );
      F.shape(
         (
            [
               [1.0, 0.915],
               [1.2, 0.915],
               [1.18, 0.955],
               [1.0, 0.955],
            ] as const
         ).map(T),
      );
      F.dot(T([1.325, 0.31]), 0.028);
      // passengers and the driver, dark against the light
      F.layer("ppl", false, false, "plain");
      const rider = (x: number, top: number, r = 0.058): void => {
         F.cap(T([x, 0.5]), 0.075, T([x, top - 0.13]), 0.07);
         F.dot(T([x + 0.01, top - r]), r);
      };
      rider(-0.98, 0.76);
      rider(-0.33, 0.78);
      rider(0.31, 0.83, 0.056); // standing
      rider(1.1, 0.79, 0.054);
      // the trim line, the door split and the skirt
      F.layer("trim", false, true);
      F.line([T([-1.3, 0.42]), T([0.58, 0.42])], 0.012);
      F.line([T([0.92, 0.42]), T([1.34, 0.42])], 0.012);
      F.line([T([0.75, 0.24]), T([0.75, 0.86])], 0.012);
      F.layer("hub", true);
      F.dot(rearW, 0.045).dot(frontW, 0.045);
   };
}

/* ---------- draw a strip ---------- */
export interface Strip extends StripBox {
   svg: SVGSVGElement;
}

const SVG_NS = "http://www.w3.org/2000/svg";
/** An SVG element with its attributes set. */
export const svgEl = <K extends keyof SVGElementTagNameMap>(
   name: K,
   attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] => {
   const el = document.createElementNS(SVG_NS, name);
   for (const [key, value] of Object.entries(attrs))
      el.setAttribute(key, String(value));
   return el;
};

// lines of one layer, joined per stroke width
const byWidth = (lines: readonly Line[]): Map<string, string> => {
   const out = new Map<string, string>();
   for (const ln of lines) {
      const key = ln.w.toFixed(1);
      out.set(key, (out.get(key) ?? "") + ln.d);
   }
   return out;
};

// frame box in figure units: width, where the ground point sits, headroom
const boxFor = (
   spec: StripSpec,
   wear: Wear | null,
): { w: number; hipX: number; top: number } => {
   // the tyres reach +/-0.52 with their outline: the whole ring stays in
   // its own frame
   if (spec.kind === "cyclist") return { w: 1.1, hipX: 0.55, top: 1.02 };
   if (spec.kind === "bus") return { w: 2.72, hipX: 1.36, top: 1.06 };
   if (spec.kind === "scooter") return { w: 0.7, hipX: 0.35, top: 1.04 };
   if (wear?.kid) return { w: 0.9, hipX: 0.42, top: 1.04 };
   return { w: 0.78, hipX: 0.39, top: spec.tall ? 1.22 : 1.04 };
};

// the window light of the bus: warm scene art, not a site token
const LIT_TOP = "rgb(255,228,176)";
const LIT_BOTTOM = "rgb(255,196,128)";

let uid = 0; // a strip's own gradient id

/** Draws one figure as a strip of `spec.frames` frames side by side. Its
    body tones are the custom properties --st-wf (body), --st-wb (back
    limbs) and --st-wc (breaks), set per lane, so the freeze can step a
    walker back to the far tone without fading it. */
export function strip(spec: StripSpec): Strip {
   const N = spec.frames;
   const h = spec.h;
   const wear = spec.kind === "walker" ? LOOKS[spec.look ?? "pack"] : null;
   const box = boxFor(spec, wear);
   const fw = Math.ceil(box.w * h);
   const fullH = Math.ceil(box.top * h) + 4;
   const fh = spec.crop
      ? Math.min(fullH, Math.ceil(spec.crop + 0.04 * h + 2))
      : fullH;
   const groundY = Math.ceil(box.top * h) + 2; // ground line inside the frame
   const hipX = Math.round(box.hipX * h);
   const draw =
      spec.kind === "cyclist"
         ? cyclistFrames(N)
         : spec.kind === "bus"
           ? busFrames(N)
           : spec.kind === "scooter"
             ? scooterFrames(N)
             : walkerFrames(spec, N);

   // gather all frames, merging each layer across frames into one path
   const merged = new Map<string, Layer>();
   for (let i = 0; i < N; i++) {
      const ox = i * fw + hipX;
      const F = new Frame({
         k: h,
         p: (q) => [ox + q[0] * h, groundY - q[1] * h],
      });
      draw(F, i);
      for (const [name, l] of F.layers) {
         const m = merged.get(name);
         if (m) {
            m.fill.push(...l.fill);
            m.lines.push(...l.lines);
         } else
            merged.set(name, { ...l, fill: [...l.fill], lines: [...l.lines] });
      }
   }
   /* True silhouettes on a lit street. Under all the pieces go, first, a
      faint hairline round the whole figure (so it never sinks into a dark
      part of the painting), then a cool rim on its top edges (the shop
      light behind it: every piece again, lifted by `lift` px). Both sit
      under every fill, so only the outer outline shows; inside, the pieces
      part by tone and by the cut-paper breaks. */
   const t = spec.tone;
   const lift = Math.max(1, Math.min(1.6, h / 190)).toFixed(2);
   const edgeW = 1.6;
   const litId = `st-lit-${++uid}`;
   const edges: SVGElement[] = [];
   const rims: SVGElement[] = [];
   const fills: SVGElement[] = [];
   let lit = false;
   const round = { "stroke-linecap": "round", "stroke-linejoin": "round" };
   for (const l of merged.values()) {
      if (l.cut) {
         for (const [w, d] of byWidth(l.lines)) {
            const cut = svgEl("path", {
               d,
               fill: "none",
               "stroke-width": w,
               "stroke-linecap": "butt",
            });
            cut.style.stroke = "var(--st-wc)";
            fills.push(cut);
         }
         continue;
      }
      lit ||= l.paint === "lit";
      const paint =
         l.paint === "lit"
            ? `url(#${litId})`
            : l.back
              ? "var(--st-wb)"
              : "var(--st-wf)";
      const rim = l.paint === "";
      if (l.fill.length) {
         const d = l.fill.join("");
         if (rim) {
            edges.push(
               svgEl("path", {
                  d,
                  fill: "none",
                  stroke: t.edge,
                  "stroke-width": edgeW,
                  "stroke-linejoin": "round",
               }),
            );
            rims.push(svgEl("path", { d, fill: t.rim }));
         }
         const body = svgEl("path", { d });
         body.style.fill = paint;
         fills.push(body);
      }
      for (const [w, d] of byWidth(l.lines)) {
         if (rim) {
            edges.push(
               svgEl("path", {
                  d,
                  fill: "none",
                  ...round,
                  stroke: t.edge,
                  "stroke-width": (Number(w) + edgeW).toFixed(1),
               }),
            );
            rims.push(
               svgEl("path", {
                  d,
                  fill: "none",
                  ...round,
                  stroke: t.rim,
                  "stroke-width": w,
               }),
            );
         }
         const line = svgEl("path", {
            d,
            fill: "none",
            ...round,
            "stroke-width": w,
         });
         line.style.stroke = paint;
         fills.push(line);
      }
   }
   const W = fw * N;
   const svg = svgEl("svg", {
      width: W,
      height: fh,
      viewBox: `0 0 ${W} ${fh}`,
      "aria-hidden": "true",
      focusable: "false",
   });
   if (lit) {
      // a bus window is lit from its ceiling: brighter at the top
      const gradient = svgEl("linearGradient", {
         id: litId,
         x1: 0,
         y1: (groundY - 0.9 * h).toFixed(1),
         x2: 0,
         y2: (groundY - 0.4 * h).toFixed(1),
         gradientUnits: "userSpaceOnUse",
      });
      gradient.append(
         svgEl("stop", {
            offset: 0,
            "stop-color": LIT_TOP,
            "stop-opacity": 0.66,
         }),
         svgEl("stop", {
            offset: 1,
            "stop-color": LIT_BOTTOM,
            "stop-opacity": 0.2,
         }),
      );
      const defs = svgEl("defs", {});
      defs.append(gradient);
      svg.append(defs);
   }
   const lifted = svgEl("g", { transform: `translate(0 -${lift})` });
   lifted.append(...rims);
   svg.append(...edges, lifted, ...fills);

   // ground speed that keeps the planted foot still (figure heights per
   // stride)
   let speed = 0;
   if (wear) {
      const stride = wear.stride ?? 1;
      const a = legAt([0, 0], 0.1, stride, SK);
      const b = legAt([0, 0], 0.4, stride, SK);
      speed = (a.ankle[0] - b.ankle[0]) / 0.3;
   }
   return { svg, fw, fh, frames: N, groundY, hipX, speed };
}
