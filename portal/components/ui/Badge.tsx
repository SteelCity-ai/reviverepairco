export type StatusVariant =
  | "default"
  | "active"
  | "complete"
  | "review"
  | "signoff"
  | "on-hold"
  | "cancelled"
  | "draft"
  | "pending"
  | "approved"
  | "rejected";

const statusStyles: Record<StatusVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  active: "bg-blue-100 text-blue-700",
  complete: "bg-green-100 text-green-700",
  review: "bg-purple-100 text-purple-700",
  signoff: "bg-amber-100 text-amber-700",
  "on-hold": "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
  draft: "bg-gray-100 text-gray-500",
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

/**
 * StatusBadge — maps domain status strings to visual variants.
 */
export function StatusBadge({ status }: { status: string }) {
  const variant = mapStatusToVariant(status);
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge variant={variant}>{label}</Badge>;
}

function mapStatusToVariant(status: string): StatusVariant {
  const s = status.toUpperCase();
  switch (s) {
    case "ACTIVE":
    case "IN_PROGRESS":
      return "active";
    case "COMPLETE":
    case "DONE":
    case "RESOLVED":
    case "VERIFIED":
      return "complete";
    case "PM_REVIEW":
      return "review";
    case "CLIENT_SIGNOFF":
      return "signoff";
    case "ON_HOLD":
      return "on-hold";
    case "CANCELLED":
      return "cancelled";
    case "DRAFT":
      return "draft";
    case "PENDING":
    case "NOT_STARTED":
    case "PLANNED":
      return "pending";
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    default:
      return "default";
  }
}
