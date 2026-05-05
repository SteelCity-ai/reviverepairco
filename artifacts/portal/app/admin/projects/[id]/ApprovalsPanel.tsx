"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api-browser";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { TaskPhoto, MainTask } from "@/lib/db";

interface Props {
  projectId: string;
  pendingPhotos: TaskPhoto[];
  mainTasksInReview: MainTask[];
}

export default function ApprovalsPanel({
  projectId: _projectId,
  pendingPhotos,
  mainTasksInReview,
}: Props) {
  const router = useRouter();
  const { api } = useApi();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function approvePhoto(id: string) {
    setBusy(id);
    setError(null);
    try {
      await api(`/photos/${id}/approve`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function rejectPhoto(id: string) {
    if (!rejectReason.trim()) {
      setError("Please enter a reason for rejecting this photo.");
      return;
    }
    setBusy(id);
    setError(null);
    try {
      await api(`/photos/${id}/reject`, {
        method: "POST",
        body: { reason: rejectReason.trim() },
      });
      setRejectingId(null);
      setRejectReason("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function approveMainTask(id: string) {
    setBusy(id);
    setError(null);
    try {
      await api(`/main-tasks/${id}/pm-approve`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
          Photos Pending PM Review ({pendingPhotos.length})
        </h2>
        {pendingPhotos.length === 0 ? (
          <p className="text-sm text-gray-400">No photos pending review.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingPhotos.map((photo) => (
              <Card key={photo.id} className="space-y-3">
                <div>
                  <p className="truncate text-sm font-medium text-[var(--color-primary)]">
                    {photo.originalFilename || photo.objectKey}
                  </p>
                  {photo.caption && (
                    <p className="mt-1 text-xs italic text-gray-500">
                      &quot;{photo.caption}&quot;
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(photo.createdAt)}
                  </p>
                </div>

                {rejectingId === photo.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      placeholder="Reason for rejection (required)"
                      className="w-full rounded border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => rejectPhoto(photo.id)}
                        disabled={busy === photo.id}
                      >
                        {busy === photo.id ? "Rejecting…" : "Confirm reject"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approvePhoto(photo.id)}
                      disabled={busy === photo.id}
                    >
                      {busy === photo.id ? "Approving…" : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRejectingId(photo.id)}
                      disabled={busy !== null}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
          Tasks Awaiting PM Approval ({mainTasksInReview.length})
        </h2>
        {mainTasksInReview.length === 0 ? (
          <p className="text-sm text-gray-400">
            No tasks awaiting PM approval. Tasks appear here once all their
            daily tasks are marked done.
          </p>
        ) : (
          <div className="space-y-2">
            {mainTasksInReview.map((mt) => (
              <Card
                key={mt.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--color-primary)]">
                    {mt.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(mt.startDate)} → {formatDate(mt.endDate)}
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    All photos must be approved or rejected before sending to
                    the client.
                  </p>
                </div>
                <Button
                  onClick={() => approveMainTask(mt.id)}
                  disabled={busy === mt.id}
                >
                  {busy === mt.id
                    ? "Sending…"
                    : "Approve & send to client"}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
