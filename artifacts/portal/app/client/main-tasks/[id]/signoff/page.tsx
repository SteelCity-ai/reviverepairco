"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useApi } from "@/lib/api-browser";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CompletionDoc {
  id: string;
  payload: {
    taskName: string;
    reviewedAt: string;
    reviewedBy: string;
    dailyTasks: Array<{
      title: string;
      completedAt: string | null;
      crewNotes: string | null;
      hoursLogged: string | null;
      photos: Array<{ id: string; originalFilename: string; caption: string | null }>;
    }>;
  };
}

interface MainTaskInfo {
  id: string;
  name: string;
  status: string;
}

export default function ClientSignoffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { api: callApi } = useApi();

  const [task, setTask] = useState<MainTaskInfo | null>(null);
  const [doc, setDoc] = useState<CompletionDoc | null>(null);
  const [signatureName, setSignatureName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [t, d] = await Promise.all([
          callApi<MainTaskInfo>(`/main-tasks/${id}`),
          callApi<CompletionDoc>(`/main-tasks/${id}/completion-document`),
        ]);
        setTask(t);
        setDoc(d);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submit = async () => {
    if (!signatureName.trim() || !confirmed) return;
    setSigning(true);
    try {
      await callApi(`/main-tasks/${id}/client-signoff`, {
        method: "POST",
        body: { signatureName, confirmed: true },
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSigning(false);
    }
  };

  if (error && !task)
    return <div className="px-4 py-5 text-sm text-red-500">{error}</div>;
  if (!task || !doc)
    return <div className="px-4 py-5 text-sm text-gray-500">Loading…</div>;

  if (done) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
    const pdfUrl = `${apiBase}/main-tasks/${id}/completion-document.pdf`;
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <Check className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-[var(--color-primary)]">
          Thank you!
        </h1>
        <p className="mt-2 text-gray-600">
          Your sign-off for <strong>{task.name}</strong> has been recorded.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-[var(--color-border)] bg-white px-4 py-2 font-semibold text-[var(--color-primary)]"
          >
            Download completion document (PDF)
          </a>
          <Link
            href="/client/projects"
            className="inline-block rounded-full bg-[var(--color-amber)] px-4 py-2 font-semibold text-[var(--color-primary)]"
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const canSign =
    task.status === "CLIENT_SIGNOFF" && signatureName.trim().length > 0 && confirmed;

  return (
    <div className="mx-auto max-w-2xl px-4 py-5">
      <Link
        href="/client/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-[var(--color-primary)]">
        Sign off: {task.name}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Reviewed {new Date(doc.payload.reviewedAt).toLocaleDateString()} by{" "}
        {doc.payload.reviewedBy}
      </p>

      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            Work Completed
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doc.payload.dailyTasks.map((dt, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--color-border)] p-3"
              >
                <p className="text-sm font-medium text-[var(--color-primary)]">
                  {dt.title}
                </p>
                {dt.completedAt && (
                  <p className="text-xs text-gray-400">
                    Completed{" "}
                    {new Date(dt.completedAt).toLocaleDateString()}
                  </p>
                )}
                {dt.crewNotes && (
                  <p className="mt-2 text-sm text-gray-600">{dt.crewNotes}</p>
                )}
                {dt.photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {dt.photos.map((p) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={p.id}
                        src={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/photos/${p.id}/file`}
                        alt={p.caption ?? p.originalFilename}
                        className="aspect-square w-full rounded-md object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {task.status !== "CLIENT_SIGNOFF" ? (
        <p className="text-sm text-gray-500">
          This task is not currently awaiting your sign-off (status:{" "}
          {task.status}).
        </p>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">
              Your signature
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Type your full name to sign"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Your full name"
            />
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I confirm this work has been completed to my satisfaction.
              </span>
            </label>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              size="lg"
              className="w-full"
              disabled={!canSign || signing}
              onClick={submit}
            >
              {signing ? "Submitting…" : "Sign & approve"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
