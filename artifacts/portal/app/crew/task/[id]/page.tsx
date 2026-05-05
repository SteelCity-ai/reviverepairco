"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Check, Trash2 } from "lucide-react";
import { useApi } from "@/lib/api-browser";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";

interface PhotoRow {
  id: string;
  objectKey: string;
  originalFilename: string;
  caption: string | null;
  pmStatus: "PENDING" | "APPROVED" | "REJECTED";
  pmRejectReason: string | null;
}

interface DailyTaskRow {
  id: string;
  title: string;
  description: string | null;
  status: "NOT_STARTED" | "DONE";
  scheduledDate: string | null;
  crewNotes: string | null;
  hoursLogged: string | null;
  mainTaskId: string;
  photos?: PhotoRow[];
}

export default function CrewTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { api: callApi, upload } = useApi();
  const [task, setTask] = useState<DailyTaskRow | null>(null);
  const [mainTaskId, setMainTaskId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const r = await callApi<DailyTaskRow>(`/daily-tasks/${id}`);
      setTask(r);
      setMainTaskId(r.mainTaskId);
      setNotes(r.crewNotes ?? "");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      await callApi(`/daily-tasks/${id}`, {
        method: "PATCH",
        body: { crewNotes: notes },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingNotes(false);
    }
  };

  const markDone = async () => {
    setCompleting(true);
    try {
      await callApi(`/daily-tasks/${id}/complete`, { method: "POST" });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCompleting(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await upload(`/photos/daily-tasks/${id}/photos`, fd);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!task && !error) {
    return <div className="px-4 py-5 text-sm text-gray-500">Loading…</div>;
  }
  if (error && !task) {
    return <div className="px-4 py-5 text-sm text-red-500">{error}</div>;
  }
  if (!task) return null;

  return (
    <div className="animate-fade-in-up px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/crew/today"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[var(--color-amber)] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        {mainTaskId && (
          <Link
            href={`/crew/main-task/${mainTaskId}`}
            className="text-xs font-medium text-[var(--color-amber)] hover:underline"
          >
            View full checklist →
          </Link>
        )}
      </div>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-primary)]">
            {task.title}
          </h1>
          <p className="text-xs text-gray-400">
            {task.scheduledDate ?? "Unscheduled"}
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {task.status !== "DONE" && (
        <div className="mb-5">
          <Button
            onClick={markDone}
            disabled={completing}
            className="w-full"
          >
            <Check className="mr-2 h-4 w-4" />
            {completing ? "Marking…" : "Mark Done"}
          </Button>
        </div>
      )}

      {task.description && (
        <Card className="mb-4">
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">
              Description
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-gray-600">
              {task.description}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            Photos
          </h3>
        </CardHeader>
        <CardContent>
          {task.photos?.length ? (
            <div className="mb-3 grid grid-cols-2 gap-3">
              {task.photos.map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/photos/${p.id}/file`}
                    alt={p.originalFilename}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="px-2 py-1.5">
                    <p className="truncate text-xs text-gray-500">
                      {p.originalFilename}
                    </p>
                    <span
                      className={`text-[10px] uppercase tracking-wide ${
                        p.pmStatus === "APPROVED"
                          ? "text-green-600"
                          : p.pmStatus === "REJECTED"
                            ? "text-red-500"
                            : "text-amber-600"
                      }`}
                    >
                      {p.pmStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-3 text-sm text-gray-400">No photos yet.</p>
          )}
          <label className="block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              disabled={uploading}
              className="hidden"
            />
            <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-gray-50">
              <Camera className="h-4 w-4" />
              {uploading ? "Uploading…" : "Add Photo"}
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            Crew Notes
          </h3>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-[var(--color-border)] p-3 text-sm text-[var(--color-primary)] placeholder:text-gray-400 focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20"
            placeholder="Notes…"
          />
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            disabled={savingNotes}
            onClick={saveNotes}
          >
            {savingNotes ? "Saving…" : "Save Notes"}
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
