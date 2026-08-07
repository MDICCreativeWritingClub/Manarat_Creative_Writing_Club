"use client";

import { colors } from "@/lib/theme";

import { useState, useEffect, useRef } from "react";
import {
  Eye, EyeOff, Lock, Settings, Palette, Crown, Star, BookOpen,
  BarChart2, Users, Archive, LogOut, Megaphone,
} from "lucide-react";
import { useSiteConfig, type SiteConfig } from "@/context/SiteConfigContext";
import { useSubmissions } from "@/context/SubmissionsContext";
import { useVotes } from "@/context/VoteContext";
import { usePublishedArticles } from "@/hooks/usePublishedArticles";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { SaveBanner, WritersListModal, type PanelTab } from "@/components/control-panel/shared";
import { OverviewTab } from "@/components/control-panel/OverviewTab";
import { ThemeTab } from "@/components/control-panel/ThemeTab";
import { WomTab } from "@/components/control-panel/WomTab";
import { ChoiceTab } from "@/components/control-panel/ChoiceTab";
import { TeamTab } from "@/components/control-panel/TeamTab";
import { ContentTab } from "@/components/control-panel/ContentTab";
import { ArchiveTab } from "@/components/control-panel/ArchiveTab";
import { NoticesTab } from "@/components/control-panel/NoticesTab";
import { getReviewerSession, signInReviewer, signOutReviewer } from "@/lib/reviewerAuth";

export function ControlPanel() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [tab, setTab] = useState<PanelTab>("overview");
  const [saved, setSaved] = useState(false);
  const [showWritersModal, setShowWritersModal] = useState(false);

  const { config, updateConfig, loading } = useSiteConfig();
  const { submissions } = useSubmissions();
  const { votes } = useVotes();
  const { allPublished } = usePublishedArticles();
  const { executives, editorialTeam, addMember, removeMember } = useTeamMembers();

  const [draft, setDraft] = useState<SiteConfig>({ ...config });

  // Re-sync draft when config loads from Supabase (async)
  const configLoaded = useRef(false);
  useEffect(() => {
    if (!loading && !configLoaded.current) {
      configLoaded.current = true;
      setDraft({ ...config });
    }
  }, [loading]);

  useEffect(() => {
    getReviewerSession().then((session) => {
      setUnlocked(!!session);
      setCheckingSession(false);
    });
  }, []);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setSigningIn(true);
    setError(null);
    const { error: signInError } = await signInReviewer(username, password);
    if (signInError) {
      setError(signInError);
      setSigningIn(false);
      return;
    }
    setUnlocked(true);
    setSigningIn(false);
    setDraft({ ...config });
  }

  async function handleLogout() {
    await signOutReviewer();
    setUnlocked(false);
  }

  function handleSave() {
    updateConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (checkingSession) {
    return (
      <div className="max-w-sm mx-auto px-5 pt-32 text-center" style={{ color: colors.gray400 }}>
        Loading...
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto px-5 pt-32 pb-20">
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: colors.gray200, backgroundColor: colors.surface }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: colors.yellow100, border: `2px solid ${colors.yellow400}` }}
          >
            <Lock size={24} style={{ color: colors.amber600 }} />
          </div>
          <h1 style={{ color: colors.heading, fontWeight: 700, fontSize: "1.4rem", marginBottom: "0.4rem" }}>
            Control Panel
          </h1>
          <p style={{ color: colors.gray500, fontSize: "0.85rem", marginBottom: "1.75rem", lineHeight: "1.6" }}>
            Administrator access only. Log in with your admin account to continue.
          </p>
          <form onSubmit={handleUnlock} className="flex flex-col gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(null); }}
              placeholder="Username"
              autoComplete="username"
              style={{
                width: "100%",
                padding: "0.65rem 1rem",
                borderRadius: "0.75rem",
                border: `1px solid ${error ? colors.red300 : colors.gray200}`,
                fontSize: "0.875rem",
                outline: "none",
                color: colors.gray900,
              }}
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Password"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "0.65rem 2.5rem 0.65rem 1rem",
                  borderRadius: "0.75rem",
                  border: `1px solid ${error ? colors.red300 : colors.gray200}`,
                  fontSize: "0.875rem",
                  outline: "none",
                  color: colors.gray900,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: colors.gray400 }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p style={{ color: colors.red600, fontSize: "0.8rem" }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={signingIn}
              className="w-full py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: colors.green900, fontWeight: 500 }}
            >
              {signingIn ? "Logging in..." : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalVotes = allPublished.reduce((sum, a) => sum + (votes[a.id] ?? a.votes), 0);
  const pendingCount  = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const uniqueWriters = new Set(allPublished.map((a) => a.author)).size;

  const tabConfig: { key: PanelTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview",         icon: <BarChart2 size={14} /> },
    { key: "theme",    label: "Theme",             icon: <Palette size={14} /> },
    { key: "wom",      label: "Writer of Month",   icon: <Crown size={14} /> },
    { key: "choice",   label: "Editor's Choice",   icon: <Star size={14} /> },
    { key: "team",     label: "Our Team",          icon: <Users size={14} /> },
    { key: "content",  label: "Content",           icon: <BookOpen size={14} /> },
    { key: "archive",  label: "Archive",           icon: <Archive size={14} /> },
    { key: "notices",  label: "Notice Board",       icon: <Megaphone size={14} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 pt-24 pb-16">
      <SaveBanner show={saved} />
      <WritersListModal isOpen={showWritersModal} onClose={() => setShowWritersModal(false)} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Settings size={22} style={{ color: colors.amber600 }} />
            <h1 style={{ color: colors.heading, fontWeight: 700, fontSize: "1.75rem" }}>Control Panel</h1>
          </div>
          <p style={{ color: colors.gray500, fontSize: "0.875rem" }}>Manage site content, themes, and settings.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border hover:opacity-90 transition-opacity"
            style={{ borderColor: colors.gray200, color: colors.gray700, backgroundColor: colors.gray100 }}
          >
            <LogOut size={13} /> Log Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-8 pb-5 border-b" style={{ borderColor: colors.gray200 }}>
        {tabConfig.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all active:scale-95"
            style={{
              backgroundColor: tab === t.key ? colors.green900 : colors.gray100,
              color: tab === t.key ? colors.white : colors.gray700,
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewTab
          allPublished={allPublished}
          votes={votes}
          totalVotes={totalVotes}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          uniqueWriters={uniqueWriters}
          config={config}
          setShowWritersModal={setShowWritersModal}
        />
      )}

      {tab === "theme" && (
        <ThemeTab config={config} draft={draft} setDraft={setDraft} updateConfig={updateConfig} handleSave={handleSave} />
      )}

      {tab === "wom" && (
        <WomTab
          config={config}
          draft={draft}
          setDraft={setDraft}
          updateConfig={updateConfig}
          allPublished={allPublished}
          handleSave={handleSave}
        />
      )}

      {tab === "choice" && (
        <ChoiceTab config={config} setDraft={setDraft} updateConfig={updateConfig} allPublished={allPublished} />
      )}

      {tab === "team" && (
        <TeamTab
          executives={executives}
          editorialTeam={editorialTeam}
          addMember={addMember}
          removeMember={removeMember}
        />
      )}

      {tab === "content" && (
        <ContentTab allPublished={allPublished} config={config} updateConfig={updateConfig} setDraft={setDraft} votes={votes} />
      )}

      {tab === "archive" && (
        <ArchiveTab allPublished={allPublished} votes={votes} config={config} updateConfig={updateConfig} setSaved={setSaved} />
      )}

      {tab === "notices" && (
        <NoticesTab config={config} updateConfig={updateConfig} setSaved={setSaved} />
      )}
    </div>
  );
}
