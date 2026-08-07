"use client";

import { colors } from "@/lib/theme";

import Link from "next/link";
import Image from "next/image";
import { PenLine } from "lucide-react";

const exploreLinks = [
  { label: "Literary Hub", to: "/hub" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "Archive", to: "/archive" },
  { label: "Our Team", to: "/team" },
];

const participateLinks = [
  { label: "Submit Work", to: "/submit" },
  { label: "Help Desk", to: "/info" },
];

export function Footer() {
  return (
    <footer style={{ backgroundColor: colors.black }} className="mt-14 pt-8 pb-5 px-6">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/mdic-logo.png" alt="MDIC Logo" width={30} height={30} />
            <span style={{ fontFamily: "var(--font-display)", color: colors.white, fontWeight: 600, fontSize: "1rem" }}>
              Manarat CWC
            </span>
          </div>
          <p style={{ color: colors.white, fontSize: "0.8rem", lineHeight: "1.7" }}>
            The Creative Writing Club of Manarat International School &amp; College — a home for student poetry,
            prose and criticism.
          </p>
        </div>

        <div>
          <p style={{ color: colors.green400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }} className="mb-4">
            Explore
          </p>
          <div className="flex flex-col gap-2.5">
            {exploreLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                style={{ color: colors.white, fontSize: "0.85rem" }}
                className="hover:text-white transition-colors w-fit"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p style={{ color: colors.green400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }} className="mb-4">
            Participate
          </p>
          <div className="flex flex-col gap-2.5">
            {participateLinks.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                style={{ color: colors.white, fontSize: "0.85rem" }}
                className="hover:text-white transition-colors w-fit"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p style={{ color: colors.green400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }} className="mb-4">
            About
          </p>
          <div className="flex items-center gap-2 mb-2">
            <PenLine size={13} style={{ color: colors.green400 }} />
            <span style={{ color: colors.white, fontSize: "0.85rem" }}>Est. 1979</span>
          </div>
          <p style={{ color: colors.white, fontSize: "0.8rem" }}>
            Manarat Dhaka International School &amp; College
          </p>
        </div>
      </div>

      <div
        className="max-w-7xl mx-auto mt-6 pt-4 flex flex-col sm:flex-row justify-between gap-3"
        style={{ borderTop: `1px solid ${colors.gray700}` }}
      >
        <p style={{ color: colors.white, fontSize: "0.75rem" }}>
          {new Date().getFullYear()} 
        </p>
        <p style={{ color: colors.white, fontSize: "0.75rem" }}>
          Built by students, for students.
        </p>
      </div>
    </footer>
  );
}
