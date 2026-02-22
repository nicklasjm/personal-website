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
  summary?: string;
  photo?: SanityImage;
  experience?: Experience[];
  education?: Education[];
  skills?: SkillGroup[];
  tools?: string[];
  languages?: Language[];
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  highlights?: string[];
}

export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
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

export async function getSettings(): Promise<SiteSettings | null> {
  return sanityClient.fetch(
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
  return sanityClient.fetch(
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
  return sanityClient.fetch(
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
      externalLink
    }`,
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return sanityClient.fetch(
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
  return sanityClient.fetch(
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
        highlights
      },
      education[]{
        institution,
        degree,
        field,
        startDate,
        endDate
      },
      skills[]{
        category,
        items
      },
      tools,
      languages[]{
        language,
        proficiency
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
