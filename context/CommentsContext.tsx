"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useSupabaseRealtime } from "@/lib/useSupabaseRealtime";

export interface Comment {
  id: string;
  articleId: string;
  parentId: string | null;
  authorName: string;
  content: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface CommentsContextType {
  comments: Comment[];
  addComment: (input: { articleId: string; authorName: string; content: string; parentId?: string | null }) => Promise<void>;
  updateStatus: (id: string, status: "approved" | "rejected") => Promise<void>;
  loading: boolean;
}

const CommentsContext = createContext<CommentsContextType | null>(null);

function mapRow(r: Record<string, unknown>): Comment {
  return {
    id: r.id as string,
    articleId: r.article_id as string,
    parentId: (r.parent_id as string | null) ?? null,
    authorName: r.author_name as string,
    content: r.content as string,
    submittedAt: r.created_at as string,
    status: r.status as "pending" | "approved" | "rejected",
  };
}

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll(): Promise<void> {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setComments(data.map(mapRow));
  }

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));
  }, []);

  useSupabaseRealtime("comments_realtime", "comments", () => {
    fetchAll();
  });

  const addComment = useCallback(
    async (input: { articleId: string; authorName: string; content: string; parentId?: string | null }): Promise<void> => {
      const id = `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = new Date().toISOString();

      const { error } = await supabase.from("comments").insert({
        id,
        article_id: input.articleId,
        parent_id: input.parentId ?? null,
        author_name: input.authorName,
        content: input.content,
        created_at: createdAt,
        status: "pending",
      });

      if (error) throw new Error("Failed to post comment");

      const newComment: Comment = {
        id,
        articleId: input.articleId,
        parentId: input.parentId ?? null,
        authorName: input.authorName,
        content: input.content,
        submittedAt: createdAt,
        status: "pending",
      };
      setComments((prev) => [newComment, ...prev]);
    },
    []
  );

  const updateStatus = useCallback(async (id: string, status: "approved" | "rejected") => {
    await supabase.from("comments").update({ status }).eq("id", id);
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, []);

  return (
    <CommentsContext.Provider value={{ comments, addComment, updateStatus, loading }}>
      {children}
    </CommentsContext.Provider>
  );
}

export function useComments() {
  const ctx = useContext(CommentsContext);
  if (!ctx) throw new Error("useComments must be used inside CommentsProvider");
  return ctx;
}
