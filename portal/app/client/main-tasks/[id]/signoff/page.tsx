"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  X,
  Download,
  Pen,
  Eraser,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ── Mock Data ───────────────────────────────────────────────

const mockMainTask = {
  id: "mt-001",
  name: "Decking Repair",
  description:
    "Inspection of roof decking after tear-off revealed rot damage on 4 sheets of OSB near the southern chimney edge. The damaged panels were removed and replaced with new 7/16\" OSB sheathing, secured with 8d ring-shank nails per code. All replaced areas were covered with ice & water shield before underlayment installation.",
};

const taskSummary = {
  dateStarted: "April 24, 2026",
  dateCompleted: "April 29, 2026",
  crewMembers: ["Mike Johnson", "Dave Williams"],
  totalHours: 12.5,
  materials: [
    "4 sheets 7/16\" OSB sheathing",
    "200x 8d ring-shank nails",
    "1 roll ice & water shield",
  ],
};

const mockPhotos = [
  { id: "fp1", caption: "Rot discovered on southern edge", url: null },
  { id: "fp2", caption: "Damaged sheathing removed", url: null },
  { id: "fp3", caption: "New OSB panels installed", url: null },
  { id: "fp4", caption: "Ice & water shield applied", url: null },
  { id: "fp5", caption: "Final inspection — decking ready", url: null },
];

const workLog = [
  { date: "Apr 24", entry: "Tear-off complete. Decking inspected. 4 sheets rot found near chimney." },
  { date: "Apr 25", entry: "Damaged sheathing cut out and removed. Area prepped for replacement." },
  { date: "Apr 26", entry: "New OSB panels cut to size and installed. Secured with ring-shank nails." },
  { date: "Apr 27", entry: "Rain delay — tarp placed over exposed area. No work performed." },
  { date: "Apr 28", entry: "Ice & water shield applied over replaced decking. PM inspection passed." },
  { date: "Apr 29", entry: "Underlayment extended over repair area. Task marked complete." },
];

// ── Signature Pad Component ─────────────────────────────────

function SignaturePad({
  onSignatureChange,
}: {
  onSignatureChange: (hasSignature: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = 160 * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = "160px";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1a202c";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ("touches" in e) {
        const touch = e.touches[0] || (e as TouchEvent).changedTouches[0];
        return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
      }
      return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    },
    [],
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getPos(e.nativeEvent);
      lastPoint.current = pos;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }
    },
    [getPos],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const pos = getPos(e.nativeEvent);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && lastPoint.current) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPoint.current = pos;
        if (!hasDrawn) {
          setHasDrawn(true);
          onSignatureChange(true);
        }
      }
    },
    [isDrawing, hasDrawn, getPos, onSignatureChange],
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasDrawn(false);
    onSignatureChange(false);
  }, [onSignatureChange]);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white">
        <canvas
          ref={canvasRef}
          className="touch-none block w-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          aria-label="Signature pad — draw your signature here"
        />
      </div>
      <p className="mt-2 text-right">
        <button
          type="button"
          onClick={clearSignature}
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition"
        >
          <Eraser className="h-3 w-3" />
          Clear Signature
        </button>
      </p>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function ClientSignOffPage() {
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSign = () => {
    setIsSigned(true);
    setShowConfirmation(true);
  };

  const canSign = hasSignature && signatureName.trim().length > 0;

  if (showConfirmation) {
    return (
      <div className="animate-fade-in-up">
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)]">Sign-Off Complete!</h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            You have signed off on <strong>{mockMainTask.name}</strong>. Your project manager has been notified and work will proceed to the next phase.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/client/projects/proj-001">
              <Button variant="secondary">Back to Project</Button>
            </Link>
            <Link href="/client/projects">
              <Button>All Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Back */}
      <Link
        href="/client/projects/proj-001"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[var(--color-amber)] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Sign-Off: {mockMainTask.name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{mockMainTask.description}</p>
      </div>

      {/* Completion Document Preview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">Completion Document</h3>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Ready for Sign-off
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Date Started</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--color-primary)]">
                  {taskSummary.dateStarted}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date Completed</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--color-primary)]">
                  {taskSummary.dateCompleted}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Crew</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--color-primary)]">
                  {taskSummary.crewMembers.join(", ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Hours</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--color-primary)]">
                  {taskSummary.totalHours}h
                </p>
              </div>
            </div>

            {/* Materials used */}
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-400 uppercase">Materials Used</p>
              <ul className="space-y-1">
                {taskSummary.materials.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-primary)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-amber)]" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Work log */}
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-400 uppercase">Work Log</p>
              <div className="space-y-2">
                {workLog.map((log) => (
                  <div key={log.date} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 font-mono text-xs text-gray-400">{log.date}</span>
                    <span className="text-[var(--color-primary)]">{log.entry}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
            <Camera className="h-4 w-4" />
            Photo Gallery
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mockPhotos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-gray-100"
              >
                <div className="flex aspect-square items-center justify-center bg-gray-100">
                  <Camera className="h-8 w-8 text-gray-300" />
                </div>
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs text-gray-500">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            <Pen className="mr-1.5 inline h-4 w-4" />
            Your Digital Signature
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-500">
            By signing below, you confirm that the work described above has been reviewed and meets your satisfaction.
          </p>

          {/* Signature pad */}
          <SignaturePad onSignatureChange={setHasSignature} />

          {/* Signature name */}
          <div>
            <Input
              label="Type your full name"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="e.g. John Smith"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button size="lg" onClick={handleSign} disabled={!canSign} className="w-full">
          <Check className="mr-2 h-5 w-5" />
          Sign &amp; Approve
        </Button>

        <Button variant="secondary" size="lg" className="w-full">
          <X className="mr-2 h-5 w-5 text-red-500" />
          Request Changes
        </Button>

        <p className="text-center text-xs text-gray-400">
          By signing, you agree that the work has been completed to your satisfaction.
          If you need changes, click &quot;Request Changes&quot; and your project manager will address them.
        </p>
      </div>
    </div>
  );
}
