import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toolrental.tt";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await prisma.tool.findMany({
    where: { status: "AVAILABLE" },
    select: { slug: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/tools`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${siteUrl}/tools/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
