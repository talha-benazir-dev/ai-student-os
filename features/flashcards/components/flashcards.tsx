"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  BookOpen,
  ChevronLeft,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Flashcard } from "../types";
import {
  getFlashcards,
  getDueFlashcards,
  createFlashcard,
  updateFlashcard,
  reviewFlashcard,
  deleteFlashcard,
} from "../actions/flashcards.actions";

type Mode = "LIBRARY" | "REVIEW" | "SUMMARY";

type FilterTab = "all" | "easy" | "medium" | "hard";

const SAVE_ERROR = "Failed to save. Please try again.";

// --- LIBRARY COMPONENTS ---

function FlashcardFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  error,
  title = "Create Flashcard",
  submitLabel = "Add Card",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (front: string, back: string, subject: string) => void;
  initialData?: { front: string; back: string; subject: string };
  error: string | null;
  title?: string;
  submitLabel?: string;
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [subject, setSubject] = useState("");
  const frontRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialData) {
          setFront(initialData.front);
          setBack(initialData.back);
          setSubject(initialData.subject);
        } else {
          setFront("");
          setBack("");
          setSubject("");
        }
        frontRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialData]);

  const isValid = front.trim() !== "" && back.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 bg-[#0f0f17] border-[#ffffff10] shadow-2xl overflow-hidden sm:rounded-2xl !bg-opacity-100 backdrop-blur-none">
        <div className="absolute inset-0 bg-[#0f0f17] -z-10" />
        <DialogHeader className="px-6 py-4 border-b border-[#ffffff10]">
          <DialogTitle className="text-lg font-semibold text-white">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.1em]">
              Front of Card
            </label>
            <Textarea
              ref={frontRef}
              placeholder="What's the question or concept?"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="min-h-[100px] bg-white/[0.03] border-[#ffffff10] text-white focus-visible:ring-[#7c5cfc]/50 resize-none text-sm p-4 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.1em]">
              Back of Card
            </label>
            <Textarea
              placeholder="The answer or explanation..."
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="min-h-[100px] bg-white/[0.03] border-[#ffffff10] text-white focus-visible:ring-[#7c5cfc]/50 resize-none text-sm p-4 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.1em]">
              Subject (Optional)
            </label>
            <Input
              placeholder="e.g. Biology, Calc II..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-white/[0.03] border-[#ffffff10] text-white focus-visible:ring-[#7c5cfc]/50 h-10 px-4 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-white/[0.02] border-t border-[#ffffff10] flex items-center justify-between">
          <div className="flex-1 mr-4">
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                isValid && onSubmit(front.trim(), back.trim(), subject.trim())
              }
              disabled={!isValid}
              className="bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white px-6 font-medium shadow-[0_0_20px_-5px_rgba(124,92,252,0.5)]"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FlashcardGridItem({
  card,
  onEditStart,
  onDelete,
  today,
}: {
  card: Flashcard;
  onEditStart: () => void;
  onDelete: () => void;
  today: string;
}) {
  const isDue = card.next_review <= today;
  const isOverdue = card.next_review < today;

  const diffBadge = {
    easy: "bg-green-500/15 text-green-400",
    medium: "bg-yellow-500/15 text-yellow-400",
    hard: "bg-red-500/15 text-red-400",
  }[card.difficulty];

  let dueText = "";
  let dueClass = "text-white/45";
  if (isOverdue) {
    dueText = "Overdue";
    dueClass = "text-red-400";
  } else if (isDue) {
    dueText = "Due today";
    dueClass = "text-violet-400";
  } else {
    const diffTime =
      new Date(card.next_review).getTime() - new Date(today).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    dueText = `In ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }

  return (
    <div className="group relative rounded-xl border border-[#ffffff10] bg-[#0f0f17]/60 backdrop-blur-md p-5 transition-all hover:border-[#ffffff20] hover:bg-[#0f0f17]/80 flex flex-col h-[180px]">
      <div className="flex-1 min-h-0">
        <p className="text-white/90 font-medium line-clamp-2 text-sm whitespace-pre-wrap">
          {card.front}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {card.subject && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#7c5cfc]/10 text-[#7c5cfc]/80 truncate max-w-[100px]">
            {card.subject}
          </span>
        )}
        <span
          className={cn(
            "text-[11px] px-2 py-0.5 rounded-full capitalize",
            diffBadge,
          )}
        >
          {card.difficulty}
        </span>
        <span className={cn("text-[11px] ml-auto font-medium", dueClass)}>
          {dueText}
        </span>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[#0f0f17] p-1 rounded-lg border border-[#ffffff10]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEditStart}
          className="h-7 w-7 text-white/50 hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-7 w-7 text-white/50 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// --- REVIEW COMPONENTS ---

function ReviewSession({
  dueCards,
  onEndSession,
  onReviewCard,
}: {
  dueCards: Flashcard[];
  onEndSession: (stats: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  }) => void;
  onReviewCard: (id: string, rating: "easy" | "medium" | "hard") => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });

  const card = dueCards[currentIndex];

  const handleRating = (rating: "easy" | "medium" | "hard") => {
    onReviewCard(card.id, rating);
    setStats((s) => ({ ...s, total: s.total + 1, [rating]: s[rating] + 1 }));

    if (currentIndex < dueCards.length - 1) {
      setFlipped(false);
      setCurrentIndex((i) => i + 1);
    } else {
      onEndSession({
        ...stats,
        total: stats.total + 1,
        [rating]: stats[rating] + 1,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#ffffff10]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Review Session</h2>
          <span className="text-sm text-white/40">
            Card {currentIndex + 1} of {dueCards.length}
          </span>
        </div>
        <Button
          variant="ghost"
          onClick={() => onEndSession(stats)}
          className="text-white/60 hover:text-white"
        >
          End Session
        </Button>
      </div>

      <div className="h-1 bg-[#ffffff10]">
        <div
          className="h-full bg-[#7c5cfc] transition-all duration-300"
          style={{ width: `${(currentIndex / dueCards.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl perspective-[1000px]">
          <div
            onClick={() => !flipped && setFlipped(true)}
            className={cn(
              "relative w-full min-h-[300px] transition-transform duration-400 ease-in-out preserve-3d cursor-pointer",
              flipped ? "rotate-y-180" : "",
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className={cn(
                "absolute inset-0 backface-hidden rounded-2xl border border-[#7c5cfc40] bg-[#0f0f17] p-8 flex flex-col shadow-[0_0_30px_-8px_#7c5cfc60]",
                flipped ? "hidden" : "",
              )}
            >
              <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl font-medium text-center text-white/90 whitespace-pre-wrap">
                  {card.front}
                </p>
              </div>
              <div className="mt-8 text-center text-sm text-[#7c5cfc]/80 animate-pulse">
                Tap to reveal
              </div>
            </div>

            {/* Back */}
            <div
              className={cn(
                "absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border border-[#ffffff20] bg-[#1a1a24] p-8 flex flex-col",
                !flipped ? "hidden" : "",
              )}
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="flex-1 flex items-center justify-center overflow-y-auto">
                <div className="w-full space-y-6">
                  <div className="pb-6 border-b border-[#ffffff10]">
                    <p className="text-sm text-white/40 mb-2 uppercase tracking-wider font-semibold text-center">
                      Front
                    </p>
                    <p className="text-base text-white/60 text-center whitespace-pre-wrap">
                      {card.front}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#7c5cfc]/80 mb-2 uppercase tracking-wider font-semibold text-center">
                      Back
                    </p>
                    <p className="text-xl text-white/95 text-center whitespace-pre-wrap font-medium">
                      {card.back}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {flipped && (
          <div className="mt-12 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
              onClick={() => handleRating("hard")}
              className="w-32 h-12 bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30"
            >
              Hard (1d)
            </Button>
            <Button
              onClick={() => handleRating("medium")}
              className="w-32 h-12 bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border border-yellow-500/30"
            >
              Good
            </Button>
            <Button
              onClick={() => handleRating("easy")}
              className="w-32 h-12 bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30"
            >
              Easy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN PAGE ---

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("LIBRARY");

  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [activeSubject, setActiveSubject] = useState<string>("All");
  const [activeDiff, setActiveDiff] = useState<FilterTab>("all");

  const [sessionStats, setSessionStats] = useState({
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [activeReviewCards, setActiveReviewCards] = useState<Flashcard[]>([]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await getFlashcards();
      if (mounted && data) {
        setCards(data);
      }
      if (mounted) setIsLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const subjects = useMemo(() => {
    const s = new Set(cards.map((c) => c.subject).filter(Boolean));
    return ["All", ...Array.from(s)];
  }, [cards]);

  const dueCards = useMemo(() => {
    return cards
      .filter((c) => c.next_review <= today)
      .sort((a, b) => a.next_review.localeCompare(b.next_review));
  }, [cards, today]);

  const visibleCards = useMemo(() => {
    return cards.filter((c) => {
      if (activeSubject !== "All" && c.subject !== activeSubject) return false;
      if (activeDiff !== "all" && c.difficulty !== activeDiff) return false;
      return true;
    });
  }, [cards, activeSubject, activeDiff]);

  const handleCreate = async (front: string, back: string, subject: string) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticCard: Flashcard = {
      id: tempId,
      user_id: "",
      front,
      back,
      subject,
      difficulty: "medium",
      next_review: today,
      interval_days: 1,
      repetitions: 0,
      created_at: new Date().toISOString(),
    };

    setCards((prev) => [optimisticCard, ...prev]);
    setShowCreate(false);
    setCreateError(null);

    const { data, error } = await createFlashcard(front, back, subject);
    if (error || !data) {
      setCards((prev) => prev.filter((c) => c.id !== tempId));
      setCreateError(SAVE_ERROR);
      setShowCreate(true);
    } else {
      setCards((prev) => prev.map((c) => (c.id === tempId ? data : c)));
    }
  };

  const handleEditSave = async (
    id: string,
    front: string,
    back: string,
    subject: string,
  ) => {
    const oldCard = cards.find((c) => c.id === id);
    if (!oldCard) return;

    const optimistic: Flashcard = { ...oldCard, front, back, subject };
    setCards((prev) => prev.map((c) => (c.id === id ? optimistic : c)));
    setEditingId(null);
    setEditError(null);

    const { data, error } = await updateFlashcard(id, front, back, subject);
    if (error || !data) {
      setCards((prev) => prev.map((c) => (c.id === id ? oldCard : c)));
      setEditingId(id);
      setEditError(SAVE_ERROR);
    } else {
      setCards((prev) => prev.map((c) => (c.id === id ? data : c)));
    }
  };

  const handleDelete = async (id: string) => {
    const oldCard = cards.find((c) => c.id === id);
    if (!oldCard) return;

    setCards((prev) => prev.filter((c) => c.id !== id));
    const { error } = await deleteFlashcard(id);
    if (error) {
      setCards((prev) => [...prev, oldCard]);
    }
  };

  const handleReviewCard = async (
    id: string,
    rating: "easy" | "medium" | "hard",
  ) => {
    const oldCard = cards.find((c) => c.id === id);
    if (!oldCard) return;

    // Optimistic local update so next time we visit library, it's correct
    let { interval_days, repetitions } = oldCard;
    if (rating === "hard") {
      interval_days = 1;
      repetitions = 0;
    } else if (rating === "medium") {
      interval_days = Math.max(2, interval_days * 2);
      repetitions += 1;
    } else if (rating === "easy") {
      interval_days = Math.max(3, interval_days * 3);
      repetitions += 1;
    }
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval_days);

    const optimistic: Flashcard = {
      ...oldCard,
      difficulty: rating,
      interval_days,
      repetitions,
      next_review: nextDate.toISOString().split("T")[0],
    };

    setCards((prev) => prev.map((c) => (c.id === id ? optimistic : c)));

    // Background sync
    const { data } = await reviewFlashcard(id, rating);
    if (data) {
      setCards((prev) => prev.map((c) => (c.id === id ? data : c)));
    }
  };

  if (mode === "REVIEW") {
    if (activeReviewCards.length === 0) {
      setMode("LIBRARY");
      return null;
    }
    return (
      <ReviewSession
        dueCards={activeReviewCards}
        onReviewCard={handleReviewCard}
        onEndSession={(stats) => {
          setSessionStats(stats);
          setMode("SUMMARY");
        }}
      />
    );
  }

  if (mode === "SUMMARY") {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0f0f17] border border-[#ffffff10] rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-500/15 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Session Complete!
          </h2>
          <p className="text-white/60 mb-8">
            You reviewed {sessionStats.total} cards today.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
              <div className="text-2xl font-semibold text-red-400 mb-1">
                {sessionStats.hard}
              </div>
              <div className="text-xs uppercase text-red-400/80 font-medium">
                Hard
              </div>
            </div>
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
              <div className="text-2xl font-semibold text-yellow-400 mb-1">
                {sessionStats.medium}
              </div>
              <div className="text-xs uppercase text-yellow-400/80 font-medium">
                Good
              </div>
            </div>
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <div className="text-2xl font-semibold text-green-400 mb-1">
                {sessionStats.easy}
              </div>
              <div className="text-xs uppercase text-green-400/80 font-medium">
                Easy
              </div>
            </div>
          </div>

          <Button
            onClick={() => setMode("LIBRARY")}
            className="w-full bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white h-12 text-base font-medium"
          >
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] lg:min-h-[100dvh] bg-[#0a0a0f]">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col flex-1">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white/95">
              Flashcards
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Active recall, scheduled by Nucleus.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {dueCards.length > 0 && (
              <Button
                onClick={() => {
                  setActiveReviewCards([...dueCards]);
                  setMode("REVIEW");
                }}
                className="bg-[#7c5cfc] hover:bg-[#6b4ce8] text-white shadow-[0_0_20px_-6px_rgba(124,92,252,0.6)]"
              >
                Study Now ({dueCards.length})
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setCreateError(null);
                setShowCreate(true);
              }}
              className="border-[#ffffff20] text-white hover:bg-[#ffffff10]"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Flashcard
            </Button>
          </div>
        </div>

        {/* FILTER ROW */}
        {cards.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between border-b border-[#ffffff10] pb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSubject(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    activeSubject === s
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:text-white/80 hover:bg-white/5",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(["all", "easy", "medium", "hard"] as FilterTab[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDiff(d)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors",
                    activeDiff === d
                      ? "bg-[#7c5cfc]/20 text-[#7c5cfc] ring-1 ring-[#7c5cfc]/40"
                      : "text-white/40 hover:bg-white/5",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTENT */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7c5cfc]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleCards.map((c) => (
              <FlashcardGridItem
                key={c.id}
                card={c}
                onEditStart={() => {
                  setEditingId(c.id);
                  setEditError(null);
                }}
                onDelete={() => handleDelete(c.id)}
                today={today}
              />
            ))}
            {visibleCards.length === 0 && cards.length > 0 && (
              <div className="col-span-full py-12 text-center text-white/40">
                No cards match your filters.
              </div>
            )}
            {cards.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="inline-flex h-12 w-12 rounded-xl bg-[#7c5cfc]/10 border border-[#7c5cfc]/25 items-center justify-center mb-4">
                  <Layers className="h-5 w-5 text-[#7c5cfc]" />
                </div>
                <p className="text-base font-medium text-white/85">
                  No flashcards yet
                </p>
                <p className="text-sm text-white/40 mt-1 max-w-xs">
                  Create your first card to start mastering your material.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <FlashcardFormModal
        isOpen={showCreate || !!editingId}
        onClose={() => {
          setShowCreate(false);
          setEditingId(null);
          setEditError(null);
        }}
        onSubmit={(front, back, subject) => {
          if (editingId) {
            handleEditSave(editingId, front, back, subject);
          } else {
            handleCreate(front, back, subject);
          }
        }}
        initialData={
          editingId ? cards.find((c) => c.id === editingId) : undefined
        }
        error={editingId ? editError : createError}
        title={editingId ? "Edit Flashcard" : "Create Flashcard"}
        submitLabel={editingId ? "Save Changes" : "Add Card"}
      />
    </div>
  );
}
