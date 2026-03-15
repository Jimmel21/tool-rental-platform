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
      className={`block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md ${className}`}
    >
      <span className="text-3xl" role="img" aria-hidden>
        {emoji}
      </span>
      <h3 className="mt-3 font-semibold text-gray-900">{name}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
      )}
      {toolCount != null && (
        <p className="mt-2 text-xs text-gray-500">{toolCount} tools</p>
      )}
    </Link>
  );
}
