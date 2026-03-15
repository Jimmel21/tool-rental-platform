type Status = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RETIRED";

const styles: Record<Status, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  RENTED: "bg-amber-100 text-amber-800",
  MAINTENANCE: "bg-blue-100 text-blue-800",
  RETIRED: "bg-gray-100 text-gray-600",
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
