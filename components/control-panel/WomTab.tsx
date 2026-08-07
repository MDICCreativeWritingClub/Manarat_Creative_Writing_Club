"use client";

import { Eye, EyeOff, Save } from "lucide-react";
import type { Article } from "@/data/articles";
import type { SiteConfig } from "@/context/SiteConfigContext";
import { colors } from "@/lib/theme";
import { inputStyle, labelStyle } from "./shared";

interface WomTabProps {
  config: SiteConfig;
  draft: SiteConfig;
  setDraft: React.Dispatch<React.SetStateAction<SiteConfig>>;
  updateConfig: (partial: Partial<SiteConfig>) => void;
  allPublished: Article[];
  handleSave: () => void;
}

export function WomTab({ config, draft, setDraft, updateConfig, allPublished, handleSave }: WomTabProps) {
  return (
            <div className="max-w-xl flex flex-col gap-5">
              <div className="rounded-xl p-4 border" style={{ backgroundColor: colors.yellow50, borderColor: colors.amber200 }}>
                <p style={{ color: colors.amber800, fontSize: "0.8rem" }}>
                  Manage the Writer of the Month section on the homepage. You can add multiple writers and toggle visibility.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <label style={{ ...labelStyle, marginBottom: 0 }}>Show Writer of the Month on Homepage</label>
                <button
                  onClick={() => {
                    const newVal = !config.womVisible;
                    updateConfig({ womVisible: newVal });
                    setDraft((d) => ({ ...d, womVisible: newVal }));
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all active:scale-95"
                  style={{
                    backgroundColor: config.womVisible ? colors.green900 : colors.gray100,
                    color: config.womVisible ? colors.white : colors.gray500,
                  }}
                >
                  {config.womVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  {config.womVisible ? "Visible" : "Hidden"}
                </button>
              </div>

              <div className="rounded-xl border p-4" style={{ backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }}>
                <p style={{ color: colors.heading, fontSize: "0.8rem", fontWeight: 500 }}>Primary Writer</p>
              </div>

              <div>
                <label style={labelStyle}>Writer Name</label>
                <input
                  style={inputStyle}
                  value={draft.womName}
                  onChange={(e) => setDraft((d) => ({ ...d, womName: e.target.value }))}
                  placeholder="Writer's name"
                />
              </div>

              <div>
                <label style={labelStyle}>Grade</label>
                <input
                  style={inputStyle}
                  value={draft.womGrade}
                  onChange={(e) => setDraft((d) => ({ ...d, womGrade: e.target.value }))}
                  placeholder="e.g. Grade 11 — AS-B"
                />
              </div>

              <div>
                <label style={labelStyle}>Featured Writing</label>
                <select
                  style={{ ...inputStyle, color: colors.gray900 }}
                  value={draft.womArticleId}
                  onChange={(e) => setDraft((d) => ({ ...d, womArticleId: e.target.value }))}
                >
                  {(() => {
                    const byAuthor = allPublished.filter((a) => a.author === draft.womName);
                    const list = byAuthor.length > 0 ? byAuthor : allPublished;
                    return list.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}{byAuthor.length === 0 ? ` — ${a.author}` : ""}</option>
                    ));
                  })()}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Bio</label>
                <textarea
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
                  value={draft.womBio}
                  onChange={(e) => setDraft((d) => ({ ...d, womBio: e.target.value }))}
                  placeholder="Short bio shown on the homepage..."
                />
              </div>

              <div className="rounded-xl border p-4" style={{ backgroundColor: colors.green900 }}>
                <p style={{ color: colors.green300, fontSize: "0.7rem", marginBottom: "0.25rem" }}>Preview — Homepage Banner</p>
                <p style={{ color: colors.white, fontWeight: 700, fontSize: "1.1rem" }}>{draft.womName || "—"}</p>
                <p style={{ color: colors.green300, fontSize: "0.8rem" }}>{draft.womGrade}</p>
                <p style={{ color: colors.green200, fontSize: "0.8rem", marginTop: "0.4rem", lineHeight: "1.5" }}>{draft.womBio || "—"}</p>
              </div>

              <button
                onClick={handleSave}
                className="self-start flex items-center gap-2 px-6 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.green900 }}
              >
                <Save size={15} /> Save
              </button>
            </div>
      
  );
}
