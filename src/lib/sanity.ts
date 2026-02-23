import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Generate an optimized image URL with sensible defaults.
 * Applies auto format (AVIF/WebP negotiation), quality, and fit.
 */
export function optimizedUrl(
  source: SanityImageSource,
  width: number,
  opts?: { height?: number; quality?: number; fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min" },
) {
  let img = builder.image(source).width(width).auto("format").quality(opts?.quality ?? 80).fit(opts?.fit ?? "max");
  if (opts?.height) img = img.height(opts.height);
  return img.url();
}

/**
 * Generate a srcset string for responsive images.
 */
export function imageSrcSet(
  source: SanityImageSource,
  widths: number[] = [400, 800, 1200],
  opts?: { quality?: number; fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale" | "min" },
) {
  return widths
    .map((w) => `${optimizedUrl(source, w, opts)} ${w}w`)
    .join(", ");
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  category: "work" | "playground" | "thoughts" | "links" | "photography";
  excerpt?: string;
  featuredImage?: SanityImage;
  featuredVideo?: SanityFile;
  videoPoster?: SanityImage;
  body?: any[];
  externalLink?: string;
  bodyImages?: SanityImage[];
  galleries?: { images: SanityImage[] }[];
}

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface SanityFile {
  _type: "file";
  asset: {
    _ref: string;
    _type: "reference";
  };
}

export interface CVData {
  name: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  summary?: any[];
  photo?: SanityImage;
  experience?: Experience[];
  education?: Education[];
  skills?: SkillGroup[];
  tools?: string[];
  languages?: Language[];
  sideProjects?: SideProject[];
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: any[];
  highlights?: string[];
}

export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: any[];
}

export interface SideProject {
  title: string;
  url?: string;
  description?: any[];
  year?: string;
}

export interface SkillGroup {
  category: string;
  items?: string[];
}

export interface Language {
  language: string;
  proficiency?: string;
}

export interface SiteSettings {
  title: string;
  description?: string;
  heroText?: string;
  ogImage?: SanityImage;
  keywords?: string[];
}

export interface Contact {
  email: string;
  socialLinks?: SocialLink[];
  availability?: "available" | "open" | "unavailable";
}

export interface SocialLink {
  platform: string;
  handle?: string;
  url: string;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

async function safeFetch<T>(query: string, params?: Record<string, unknown>): Promise<T | null> {
  try {
    return await sanityClient.fetch<T>(query, params);
  } catch (err) {
    console.warn("[sanity] Fetch failed, returning null:", (err as Error).message);
    return null;
  }
}

export async function getSettings(): Promise<SiteSettings | null> {
  return safeFetch(
    `*[_type == "siteSettings"][0]{
      title,
      description,
      heroText,
      ogImage,
      keywords
    }`,
  );
}

export async function getContact(): Promise<Contact | null> {
  return safeFetch(
    `*[_type == "contact"][0]{
      email,
      socialLinks[]{
        platform,
        handle,
        url
      },
      availability
    }`,
  );
}

export async function getAllPosts(): Promise<Post[]> {
  return (
    (await safeFetch<Post[]>(
      `*[_type == "post"] | order(publishedAt desc){
      _id,
      title,
      slug,
      publishedAt,
      category,
      excerpt,
      featuredImage{
        ...,
        asset->
      },
      featuredVideo{
        ...,
        asset->
      },
      videoPoster{
        ...,
        asset->
      },
      externalLink,
      "bodyImages": body[_type == "image"]{
        ...,
        asset->
      },
      "galleries": body[_type == "gallery"]{
        images[]{
          ...,
          asset->
        }
      }
    }`,
    )) ?? []
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return safeFetch(
    `*[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      publishedAt,
      category,
      excerpt,
      featuredImage{
        ...,
        asset->
      },
      featuredVideo{
        ...,
        asset->
      },
      videoPoster{
        ...,
        asset->
      },
      body[]{
        ...,
        _type == "image" => {
          ...,
          asset->
        },
        _type == "videoEmbed" => {
          ...,
          video{ asset-> },
          poster{ asset-> }
        },
        _type == "gallery" => {
          ...,
          images[]{
            ...,
            asset->
          }
        }
      },
      externalLink
    }`,
    { slug },
  );
}

export async function getCVData(): Promise<CVData | null> {
  return safeFetch(
    `*[_type == "cv"][0]{
      name,
      jobTitle,
      email,
      phone,
      location,
      website,
      linkedin,
      summary,
      photo{
        ...,
        asset->
      },
      experience[]{
        company,
        role,
        location,
        startDate,
        endDate,
        current,
        description,
        highlights
      },
      education[]{
        institution,
        degree,
        field,
        startDate,
        endDate,
        description
      },
      skills[]{
        category,
        items
      },
      tools,
      languages[]{
        language,
        proficiency
      },
      sideProjects[]{
        title,
        url,
        description,
        year
      }
    }`,
  );
}

export function getFileUrl(ref: string): string {
  const [, id, extension] = ref.split("-");
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${extension}`;
}
