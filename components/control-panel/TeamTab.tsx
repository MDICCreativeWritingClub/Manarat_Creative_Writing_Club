"use client";

import { useState } from "react";
import { GraduationCap, Plus, Save, Trash2, Users } from "lucide-react";
import type { StaffMember } from "@/data/articles";
import { colors } from "@/lib/theme";
import { inputStyle, labelStyle } from "./shared";

interface TeamTabProps {
  executives: StaffMember[];
  editorialTeam: StaffMember[];
  addMember: (member: StaffMember) => void;
  removeMember: (member: StaffMember) => void;
}

export function TeamTab({ executives, editorialTeam, addMember, removeMember }: TeamTabProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    name: "",
    role: "",
    period: "",
    section: "executives" as "executives" | "editorial",
    grade: "",
  });

  return (
            <div className="max-w-3xl flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <p style={{ color: colors.gray500, fontSize: "0.85rem" }}>
                  Manage who appears in Our Team — Executives and the Editorial Team.
                </p>
                <button
                  onClick={() => setShowAddMember((s) => !s)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity shrink-0"
                  style={{ backgroundColor: colors.green900 }}
                >
                  <Plus size={14} /> Add New Member
                </button>
              </div>

              {showAddMember && (
                <div className="rounded-xl border p-5 flex flex-col gap-4" style={{ borderColor: colors.badgeBorder, backgroundColor: colors.badgeBg }}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input
                        style={inputStyle}
                        value={memberForm.name}
                        onChange={(e) => setMemberForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Ms. Nadia Karim"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Role</label>
                      <input
                        style={inputStyle}
                        value={memberForm.role}
                        onChange={(e) => setMemberForm((f) => ({ ...f, role: e.target.value }))}
                        placeholder="e.g. Faculty Advisor / Editor-in-Chief"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Section</label>
                      <select
                        style={{ ...inputStyle, color: colors.gray900 }}
                        value={memberForm.section}
                        onChange={(e) => setMemberForm((f) => ({ ...f, section: e.target.value as "executives" | "editorial" }))}
                      >
                        <option value="executives">Executives</option>
                        <option value="editorial">Editorial Team</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Period</label>
                      <input
                        style={inputStyle}
                        value={memberForm.period}
                        onChange={(e) => setMemberForm((f) => ({ ...f, period: e.target.value }))}
                        placeholder="e.g. 2025–Present"
                      />
                    </div>
                  </div>

                  {memberForm.section === "editorial" && (
                    <div>
                      <label style={labelStyle}>Grade</label>
                      <input
                        style={inputStyle}
                        value={memberForm.grade}
                        onChange={(e) => setMemberForm((f) => ({ ...f, grade: e.target.value }))}
                        placeholder="e.g. Grade 11"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!memberForm.name.trim() || !memberForm.role.trim() || !memberForm.period.trim()) return;
                        addMember({
                          name: memberForm.name.trim(),
                          role: memberForm.role.trim(),
                          period: memberForm.period.trim(),
                          type: memberForm.section === "executives" ? "teacher" : "student",
                          grade: memberForm.section === "editorial" ? memberForm.grade.trim() || undefined : undefined,
                        });
                        setMemberForm({ name: "", role: "", period: "", section: "executives", grade: "" });
                        setShowAddMember(false);
                      }}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: colors.green900 }}
                    >
                      <Save size={14} /> Save Member
                    </button>
                    <button
                      onClick={() => setShowAddMember(false)}
                      className="px-5 py-2 rounded-xl text-sm border hover:bg-gray-50 dark:hover:bg-[var(--token-gray100)] transition-all active:scale-95"
                      style={{ borderColor: colors.gray200, color: colors.gray700 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap size={16} style={{ color: colors.green600 }} />
                  <h2 style={{ color: colors.heading, fontWeight: 600, fontSize: "1rem" }}>Executives</h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.gray200 }} />
                </div>
                <div className="flex flex-col gap-3">
                  {executives.map((m) => (
                    <div
                      key={m.id ?? m.name + m.period}
                      className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{ backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: colors.green900 }}
                      >
                        <GraduationCap size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ color: colors.heading, fontWeight: 600, fontSize: "0.9rem" }}>{m.name}</p>
                        <p style={{ color: colors.green600, fontSize: "0.8rem" }}>{m.role}</p>
                      </div>
                      <span style={{ color: colors.gray400, fontSize: "0.75rem", whiteSpace: "nowrap" }}>{m.period}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${m.name} from Our Team? This cannot be undone.`)) removeMember(m);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:opacity-80 transition-opacity shrink-0"
                        style={{ backgroundColor: colors.red50, color: colors.red600, border: `1px solid ${colors.red200}` }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  ))}
                  {executives.length === 0 && (
                    <p style={{ color: colors.gray400, fontSize: "0.8rem" }}>No executives added yet.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Users size={16} style={{ color: colors.green600 }} />
                  <h2 style={{ color: colors.heading, fontWeight: 600, fontSize: "1rem" }}>Editorial Team</h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: colors.gray200 }} />
                </div>
                <div className="flex flex-col gap-3">
                  {editorialTeam.map((m) => (
                    <div
                      key={m.id ?? m.name + m.period}
                      className="flex items-center gap-4 p-4 rounded-xl border"
                      style={{ backgroundColor: colors.surface, borderColor: colors.gray200 }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: colors.gray500 }}
                      >
                        {m.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ color: colors.heading, fontWeight: 600, fontSize: "0.9rem" }}>{m.name}</p>
                        <p style={{ color: colors.green600, fontSize: "0.8rem" }}>{m.role}</p>
                        {m.grade && <p style={{ color: colors.gray500, fontSize: "0.75rem" }}>{m.grade}</p>}
                      </div>
                      <span style={{ color: colors.gray400, fontSize: "0.75rem", whiteSpace: "nowrap" }}>{m.period}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${m.name} from Our Team? This cannot be undone.`)) removeMember(m);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs hover:opacity-80 transition-opacity shrink-0"
                        style={{ backgroundColor: colors.red50, color: colors.red600, border: `1px solid ${colors.red200}` }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  ))}
                  {editorialTeam.length === 0 && (
                    <p style={{ color: colors.gray400, fontSize: "0.8rem" }}>No editorial team members added yet.</p>
                  )}
                </div>
              </div>
            </div>
      
  );
}
