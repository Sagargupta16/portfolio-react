import type { Certification } from "@/types";

/* A certification counts as active until the end of its expiry day (UTC),
   matching how CertBadge labels it "Expired". */
export const isCertActive = (cert: Certification, now = new Date()) =>
   !cert.expiryDate ||
   new Date(`${cert.expiryDate}T23:59:59Z`).getTime() >= now.getTime();

/** Active certifications first, expired ones after, each group in data order. */
export const sortActiveFirst = (certs: Certification[], now = new Date()) => [
   ...certs.filter((c) => isCertActive(c, now)),
   ...certs.filter((c) => !isCertActive(c, now)),
];
