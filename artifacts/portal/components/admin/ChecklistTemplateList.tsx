"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChecklistTemplateItem {
  label: string;
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  items: ChecklistTemplateItem[];
  createdAt: string;
}

// ── Props ─────────────────────────────────────────────────────────────────

interface ChecklistTemplateListProps {
  templates: ChecklistTemplate[];
  onSelect: (template: ChecklistTemplate) => void;
  selectedId: string | null;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ChecklistTemplateList({
  templates,
  onSelect,
  selectedId,
}: ChecklistTemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-300 italic">
        No templates yet. Create your first checklist template.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {templates.map((template) => {
        const isSelected = selectedId === template.id;
        const requiredCount = template.items.filter((i) => i.required).length;

        return (
          <Card
            key={template.id}
            className={cn(
              "rounded-2xl border border-[var(--color-border)] bg-white shadow-sm cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-amber-400 border-amber-400",
            )}
            onClick={() => onSelect(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1a202c]">{template.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{template.items.length} items</span>
                    {requiredCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-red-400">{requiredCount} required</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge className={cn("text-[10px]", isSelected ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500")}>
                  {isSelected ? "Selected" : "Click to view"}
                </Badge>
              </div>

              {/* Expanded items */}
              {isSelected && (
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                  {template.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 text-[8px]",
                          item.required ? "border-red-300 bg-red-50 text-red-500" : "border-gray-200 bg-gray-50 text-gray-400",
                        )}
                      >
                        {item.required ? "!" : "•"}
                      </span>
                      <span className="text-gray-600">{item.label}</span>
                      {item.required && (
                        <Badge className="text-[9px] bg-red-100 text-red-600 ml-auto">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
