import { formatTTD } from "@/lib/utils/currency";

interface PriceDisplayProps {
  amount: number;
  className?: string;
  /** Show "per day" suffix */
  perDay?: boolean;
  /** Show "per week" suffix */
  perWeek?: boolean;
}

export function PriceDisplay({
  amount,
  className = "",
  perDay,
  perWeek,
}: PriceDisplayProps) {
  const suffix = perWeek ? " / week" : perDay ? " / day" : "";
  return (
    <span className={className}>
      <span className="text-primary">{formatTTD(amount)}</span>
      {suffix && <span className="text-muted">{suffix}</span>}
    </span>
  );
}
