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
      {formatTTD(amount)}
      {suffix && <span className="text-gray-500">{suffix}</span>}
    </span>
  );
}
