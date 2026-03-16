type Status = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RETIRED";

const styles: Record<Status, string> = {
  AVAILABLE: "bg-success text-white",
  RENTED: "bg-amber-100 text-amber-900",
  MAINTENANCE: "bg-primary/15 text-primary",
  RETIRED: "bg-gray-200 text-navy",
};

const labels: Record<Status, string> = {
  AVAILABLE: "Available",
  RENTED: "Rented",
  MAINTENANCE: "Maintenance",
  RETIRED: "Retired",
};

interface AvailabilityBadgeProps {
  status: Status;
  className?: string;
}

export function AvailabilityBadge({ status, className = "" }: AvailabilityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  );
}
