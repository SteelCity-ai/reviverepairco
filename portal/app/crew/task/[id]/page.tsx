"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Clock, Check, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ── Mock Data ───────────────────────────────────────────────

const mockTask = {
  id: "dt-001",
  title: "Tear off shingles — front slope",
  projectName: "Smith Residence",
  mainTaskName: "Roof Replacement — Front Slope",
  description:
    "Remove all existing asphalt shingles down to the decking on the front slope (~1,200 sq ft). Inspect decking for rot or water damage. Bag and dispose of all debris in the on-site dumpster.",
  status: "IN_PROGRESS" as const,
  hoursLogged: 1.5,
  crewNotes: "Some rot found near the southern edge. Notified PM via chat. Continuing with tear-off on north side.",
};

const initialPhotos = [
  { id: "p1", caption: "Front slope before tear-off", url: null },
  { id: "p2", caption: "Decking after shingle removal", url: null },
];

const initialMaterials = [
  { id: "m1", name: "30-year architectural shingles", qty: 12, unit: "bundles" },
  { id: "m2", name: "Synthetic underlayment", qty: 2, unit: "rolls" },
];

const initialChecklist = [
  { id: "c1", text: "Set up ladder and safety harness", done: true },
  { id: "c2", text: "Remove ridge cap shingles", done: true },
  { id: "c3", text: "Tear off field shingles", done: false },
  { id: "c4", text: "Inspect decking for rot", done: false },
  { id: "c5", text: "Sweep and clean deck surface", done: false },
];

// ── Page ────────────────────────────────────────────────────

export default function CrewTaskDetailPage() {
  const [status, setStatus] = useState<string>(mockTask.status);
  const [notes, setNotes] = useState(mockTask.crewNotes);
  const [photos, setPhotos] = useState(initialPhotos);
  const [materials, setMaterials] = useState(initialMaterials);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: "", qty: 1, unit: "" });

  const handleStart = () => setStatus("IN_PROGRESS");
  const handleDone = () => setStatus("DONE");
  const isDone = status === "DONE";

  const toggleCheck = (id: string) => {
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));
  };

  const addPhoto = () => {
    setPhotos((prev) => [...prev, { id: `p${Date.now()}`, caption: "New photo", url: null }]);
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const addMaterial = () => {
    if (!newMaterial.name.trim() || !newMaterial.unit.trim()) return;
    setMaterials((prev) => [
      ...prev,
      { id: `m${Date.now()}`, name: newMaterial.name, qty: newMaterial.qty, unit: newMaterial.unit },
    ]);
    setNewMaterial({ name: "", qty: 1, unit: "" });
    setShowAddMaterial(false);
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className={cn("animate-fade-in-up px-4 py-5", isDone && "opacity-80")}>
      {/* Back */}
      <Link
        href="/crew/today"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[var(--color-amber)] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Day
      </Link>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-bold text-[var(--color-primary)]">{mockTask.title}</h1>
          <StatusBadge status={status} />
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {mockTask.projectName} · {mockTask.mainTaskName}
        </p>
      </div>

      {/* Status actions */}
      <div className="mb-5 flex gap-3">
        {status !== "IN_PROGRESS" && status !== "DONE" && (
          <Button onClick={handleStart} className="flex-1 text-sm">
            Start Task
          </Button>
        )}
        {(status === "NOT_STARTED" || status === "IN_PROGRESS") && (
          <Button
            onClick={handleDone}
            variant="secondary"
            className={cn("flex-1 text-sm", status === "IN_PROGRESS" && "border-green-300 text-green-700")}
          >
            <Check className="mr-1.5 h-4 w-4" />
            Mark Done
          </Button>
        )}
        {status === "DONE" && (
          <p className="text-sm font-medium text-green-600">✓ Task completed</p>
        )}
      </div>

      {/* Description */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">Description</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-gray-600">{mockTask.description}</p>
        </CardContent>
      </Card>

      {/* Hours logged */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">Hours Logged</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-lg font-bold text-[var(--color-primary)]">
              {mockTask.hoursLogged}
            </span>
            <span className="text-sm text-gray-400">hours</span>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            Checklist ({checklist.filter((c) => c.done).length}/{checklist.length})
          </h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="flex w-full items-start gap-2.5 rounded-lg p-1.5 text-left transition active:bg-gray-50"
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition",
                      item.done
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 hover:border-[var(--color-amber)]",
                    )}
                  >
                    {item.done && <Check className="h-3 w-3" />}
                  </div>
                  <span
                    className={cn(
                      "text-sm transition",
                      item.done ? "text-gray-400 line-through" : "text-[var(--color-primary)]",
                    )}
                  >
                    {item.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">Photos</h3>
          </div>
        </CardHeader>
        <CardContent>
          {photos.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                  <div className="flex aspect-square items-center justify-center bg-gray-100">
                    <Camera className="h-8 w-8 text-gray-300" />
                  </div>
                  <div className="flex items-center justify-between px-2.5 py-2">
                    <p className="truncate text-xs text-gray-500">{photo.caption}</p>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="ml-1 rounded p-0.5 text-gray-400 hover:text-red-500 transition"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button variant="secondary" size="sm" onClick={addPhoto} className="w-full text-xs">
            <Camera className="mr-1.5 h-4 w-4" />
            Take Photo
          </Button>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">Crew Notes</h3>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-[var(--color-border)] p-3 text-sm text-[var(--color-primary)] placeholder:text-gray-400 focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20 transition resize-none"
            placeholder="Add notes about your progress, issues found, weather, etc..."
          />
        </CardContent>
      </Card>

      {/* Materials */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">Materials Used</h3>
            <button
              onClick={() => setShowAddMaterial(!showAddMaterial)}
              className="rounded-full p-1 text-[var(--color-amber)] hover:bg-amber-50 transition"
              aria-label="Add material"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {materials.length > 0 ? (
            <ul className="divide-y divide-[var(--color-border)]">
              {materials.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-primary)]">{m.name}</p>
                    <p className="text-xs text-gray-400">
                      {m.qty} {m.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMaterial(m.id)}
                    className="ml-2 rounded p-1 text-gray-400 hover:text-red-500 transition"
                    aria-label="Remove material"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-2 text-center text-sm text-gray-400">No materials logged</p>
          )}

          {showAddMaterial && (
            <div className="mt-3 space-y-2 rounded-lg bg-[var(--color-surface)] p-3">
              <Input
                label="Material name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Roofing nails"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="Qty"
                    type="number"
                    min={1}
                    value={newMaterial.qty}
                    onChange={(e) => setNewMaterial((p) => ({ ...p, qty: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Unit"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial((p) => ({ ...p, unit: e.target.value }))}
                    placeholder="bundles, rolls, pcs"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addMaterial} className="flex-1 text-xs">
                  Add Material
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddMaterial(false)} className="text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
