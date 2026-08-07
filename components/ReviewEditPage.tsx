"use client";

import { colors } from "@/lib/theme";

import { useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Undo2, Redo2, CheckCircle, Lock,
} from "lucide-react";
import { useSubmissions } from "@/context/SubmissionsContext";
import { getReviewerSession } from "@/lib/reviewerAuth";
import { FormattingToolbar } from "@/components/FormattingToolbar";

interface Draft {
  title: string;
  content: string;
  name: string;
  studentCode: string;
  grade: string;
}

interface HistoryState {
  entries: Draft[];
  index: number;
}

type HistoryAction =
  | { type: "commit"; value: Draft }
  | { type: "undo" }
  | { type: "redo" };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "commit": {
      const current = state.entries[state.index];
      if (
        current.title === action.value.title &&
        current.content === action.value.content &&
        current.name === action.value.name &&
        current.studentCode === action.value.studentCode &&
        current.grade === action.value.grade
      ) {
        return state;
      }
      const truncated = state.entries.slice(0, state.index + 1);
      const entries = [...truncated, action.value];
      return { entries, index: entries.length - 1 };
    }
    case "undo":
      return { ...state, index: Math.max(0, state.index - 1) };
    case "redo":
      return { ...state, index: Math.min(state.entries.length - 1, state.index + 1) };
    default:
      return state;
  }
}

const COMMIT_DEBOUNCE_MS = 500;

export function ReviewEditPage({ id }: { id: string }) {
  const { submissions, updateSubmission, loading } = useSubmissions();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [saving, setSaving] = useState<"approved" | "rejected" | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const submission = submissions.find((s) => s.id === id);

  const [history, dispatch] = useReducer(historyReducer, {
    entries: [{ title: "", content: "", name: "", studentCode: "", grade: "" }],
    index: 0,
  });
  const initialized = useRef(false);

  useEffect(() => {
    getReviewerSession().then((session) => setAuthorized(!!session));
  }, []);

  useEffect(() => {
    if (submission && !initialized.current) {
      dispatch({
        type: "commit",
        value: {
          title: submission.title,
          content: submission.content,
          name: submission.name,
          studentCode: submission.studentCode,
          grade: submission.grade,
        },
      });
      initialized.current = true;
    }
  }, [submission]);

  const draft = history.entries[history.index];
  const canUndo = history.index > 0;
  const canRedo = history.index < history.entries.length - 1;

  function scheduleCommit(next: Draft) {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      dispatch({ type: "commit", value: next });
    }, COMMIT_DEBOUNCE_MS);
  }

  const [liveDraft, setLiveDraft] = useState<Draft>(draft);
  useEffect(() => {
    setLiveDraft(draft);
  }, [draft]);

  function handleChange(field: keyof Draft, value: string) {
    const next = { ...liveDraft, [field]: value };
    setLiveDraft(next);
    scheduleCommit(next);
  }

  function flushPendingCommit() {
    if (commitTimer.current) {
      clearTimeout(commitTimer.current);
      commitTimer.current = null;
    }
    dispatch({ type: "commit", value: liveDraft });
  }

  function handleUndo() {
    flushPendingCommit();
    dispatch({ type: "undo" });
  }

  function handleRedo() {
    dispatch({ type: "redo" });
  }

  async function handleSave(status: "approved" | "rejected") {
    if (!submission) return;
    flushPendingCommit();

    if (!/^\d{1,9}$/.test(liveDraft.studentCode)) {
      setSaveError("Student code must contain only numbers (up to 9 digits).");
      return;
    }

    setSaving(status);
    setSaveError(null);
    try {
      await updateSubmission(
        submission.id,
        {
          title: liveDraft.title,
          content: liveDraft.content,
          name: liveDraft.name,
          studentCode: liveDraft.studentCode,
          grade: liveDraft.grade,
        },
        status
      );
      window.location.href = "/review";
    } catch {
      setSaveError("Failed to save changes. Please try again.");
      setSaving(null);
    }
  }

  if (authorized === null || loading) {
    return <div className="max-w-2xl mx-auto px-5 pt-32 text-center" style={{ color: colors.gray400 }}>Loading...</div>;
  }

  if (!authorized) {
    return (
      <div className="max-w-sm mx-auto px-5 pt-32 pb-20 text-center">
        <div className="rounded-2xl border p-8" style={{ borderColor: colors.gray200, backgroundColor: colors.surface }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: colors.yellow100, border: `2px solid ${colors.amber200}` }}
          >
            <Lock size={24} style={{ color: colors.amber800 }} />
          </div>
          <h1 style={{ color: colors.heading, fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Editor Access Required
          </h1>
          <p style={{ color: colors.gray500, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Please unlock the Review Panel with your editor code before editing submissions.
          </p>
          <Link
            href="/review"
            className="inline-block px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.green900 }}
          >
            Go to Review Panel
          </Link>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-sm mx-auto px-5 pt-32 pb-20 text-center">
        <p style={{ color: colors.gray500, fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          This submission could not be found. It may have already been actioned.
        </p>
        <Link
          href="/review"
          className="inline-block px-5 py-2 rounded-xl text-white text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.green900 }}
        >
          Back to Review Panel
        </Link>
      </div>
    );
  }

  const metaInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.6rem",
    border: `1px solid ${colors.gray200}`,
    fontSize: "0.85rem",
    backgroundColor: colors.surface,
    color: colors.gray800,
    outline: "none",
  };

  return (
    <div className="max-w-3xl mx-auto px-5 pt-24 pb-16">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/review"
          className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
          style={{ color: colors.gray500 }}
        >
          <ArrowLeft size={16} /> Discard &amp; Go Back
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all disabled:opacity-40 active:scale-95"
            style={{ backgroundColor: colors.gray100, color: colors.gray700 }}
            title="Undo"
          >
            <Undo2 size={14} /> Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all disabled:opacity-40 active:scale-95"
            style={{ backgroundColor: colors.gray100, color: colors.gray700 }}
            title="Redo"
          >
            <Redo2 size={14} /> Redo
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <div>
          <label style={{ color: colors.gray500, fontSize: "0.7rem", display: "block", marginBottom: "0.3rem" }}>
            Name
          </label>
          <input
            type="text"
            value={liveDraft.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={flushPendingCommit}
            style={metaInputStyle}
          />
        </div>
        <div>
          <label style={{ color: colors.gray500, fontSize: "0.7rem", display: "block", marginBottom: "0.3rem" }}>
            Student Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={liveDraft.studentCode}
            onChange={(e) => handleChange("studentCode", e.target.value.replace(/\D/g, "").slice(0, 9))}
            onBlur={flushPendingCommit}
            style={metaInputStyle}
          />
        </div>
        <div>
          <label style={{ color: colors.gray500, fontSize: "0.7rem", display: "block", marginBottom: "0.3rem" }}>
            Grade
          </label>
          <input
            type="text"
            value={liveDraft.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            onBlur={flushPendingCommit}
            style={metaInputStyle}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs"
          style={{ backgroundColor: colors.badgeBg, color: colors.badgeText, border: `1px solid ${colors.badgeBorder}` }}
        >
          {submission.category}
        </span>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs"
          style={{ backgroundColor: colors.violet50, color: colors.violet700, border: `1px solid ${colors.violet200}` }}
        >
          Theme: {submission.theme}
        </span>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div>
          <label style={{ color: colors.gray500, fontSize: "0.75rem", display: "block", marginBottom: "0.35rem" }}>
            Title
          </label>
          <input
            type="text"
            value={liveDraft.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={flushPendingCommit}
            style={{
              width: "100%",
              padding: "0.65rem 1rem",
              borderRadius: "0.75rem",
              border: `1px solid ${colors.green200}`,
              fontSize: "1rem",
              fontWeight: 600,
              backgroundColor: colors.surface,
              color: colors.heading,
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ color: colors.gray500, fontSize: "0.75rem", display: "block", marginBottom: "0.35rem" }}>
            Content
          </label>
          <FormattingToolbar textareaRef={contentRef} onChange={(value) => handleChange("content", value)} />
          <textarea
            ref={contentRef}
            value={liveDraft.content}
            onChange={(e) => handleChange("content", e.target.value)}
            onBlur={flushPendingCommit}
            rows={16}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "0.75rem",
              border: `1px solid ${colors.gray200}`,
              fontSize: "0.9rem",
              lineHeight: "1.7",
              color: colors.gray700,
              outline: "none",
              resize: "vertical",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
      </div>

      {saveError && (
        <div className="rounded-xl px-4 py-3 mb-4 text-sm" style={{ backgroundColor: colors.red100, color: colors.red700 }}>
          {saveError}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleSave("approved")}
          disabled={saving !== null}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-60 active:scale-95"
          style={{ backgroundColor: colors.green900 }}
        >
          <CheckCircle size={16} /> {saving === "approved" ? "Saving..." : "Save & Approve"}
        </button>
      </div>
    </div>
  );
}
