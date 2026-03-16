import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  toolCount?: number;
  className?: string;
}

const iconMap: Record<string, string> = {
  wrench: "🔧",
  leaf: "🌿",
  truck: "🚚",
  sparkles: "✨",
  building: "🏗️",
  bolt: "⚡",
};

export function CategoryCard({
  name,
  slug,
  description,
  icon,
  toolCount,
  className = "",
}: CategoryCardProps) {
  const emoji = icon && iconMap[icon] ? iconMap[icon] : "📦";
  return (
    <Link
      href={`/tools?category=${encodeURIComponent(slug)}`}
      className={`block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md ${className}`}
    >
      <span className="text-3xl" role="img" aria-hidden>
        {emoji}
      </span>
      <h3 className="mt-3 font-semibold text-navy">{name}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted line-clamp-2">{description}</p>
      )}
      {toolCount != null && (
        <p className="mt-2 text-xs text-muted uppercase tracking-wide">{toolCount} tools</p>
      )}
    </Link>
  );
}
