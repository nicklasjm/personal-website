// ─── Types ───────────────────────────────────────────────────────────────────

interface Facet {
  index: { byteStart: number; byteEnd: number };
  features: Array<
    | { $type: "app.bsky.richtext.facet#link"; uri: string }
    | { $type: "app.bsky.richtext.facet#mention"; did: string }
    | { $type: "app.bsky.richtext.facet#tag"; tag: string }
  >;
}

export interface BlueskyImage {
  thumb: string;
  fullsize: string;
  alt: string;
  aspectRatio?: { width: number; height: number };
}

export interface BlueskyPost {
  uri: string;
  url: string;
  text: string;
  textHtml: string;
  createdAt: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  images?: BlueskyImage[];
  externalLink?: {
    uri: string;
    title?: string;
    description?: string;
    thumb?: string;
  };
  quotePost?: {
    url: string;
    author: { handle: string; displayName?: string };
    text?: string;
  };
  replyCount: number;
  repostCount: number;
  likeCount: number;
  isReply: boolean;
  replyToHandle?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function atUriToUrl(uri: string, handle: string): string {
  const rkey = uri.split("/").pop() ?? "";
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Render post text with AT Protocol facets (links, mentions, hashtags).
 * Facets use UTF-8 byte offsets, so we decode via TextEncoder/TextDecoder.
 */
export function renderFacets(text: string, facets?: Facet[]): string {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(text);

  if (!facets || facets.length === 0) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  const sorted = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);
  let result = "";
  let cursor = 0;

  for (const facet of sorted) {
    if (facet.index.byteStart > cursor) {
      result += escapeHtml(decoder.decode(bytes.slice(cursor, facet.index.byteStart)));
    }

    const facetText = escapeHtml(decoder.decode(bytes.slice(facet.index.byteStart, facet.index.byteEnd)));
    const linkFeature = facet.features.find((f) => f.$type === "app.bsky.richtext.facet#link") as
      | { $type: "app.bsky.richtext.facet#link"; uri: string }
      | undefined;
    const mentionFeature = facet.features.find((f) => f.$type === "app.bsky.richtext.facet#mention") as
      | { $type: "app.bsky.richtext.facet#mention"; did: string }
      | undefined;
    const tagFeature = facet.features.find((f) => f.$type === "app.bsky.richtext.facet#tag") as
      | { $type: "app.bsky.richtext.facet#tag"; tag: string }
      | undefined;

    if (linkFeature) {
      result += `<a href="${escapeHtml(linkFeature.uri)}" target="_blank" rel="noopener noreferrer">${facetText}</a>`;
    } else if (mentionFeature) {
      result += `<a href="https://bsky.app/profile/${escapeHtml(mentionFeature.did)}" target="_blank" rel="noopener noreferrer">${facetText}</a>`;
    } else if (tagFeature) {
      result += `<a href="https://bsky.app/hashtag/${encodeURIComponent(tagFeature.tag)}" target="_blank" rel="noopener noreferrer">${facetText}</a>`;
    } else {
      result += facetText;
    }

    cursor = facet.index.byteEnd;
  }

  if (cursor < bytes.length) {
    result += escapeHtml(decoder.decode(bytes.slice(cursor)));
  }

  return result.replace(/\n/g, "<br>");
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

/**
 * Fetch the latest posts from a public Bluesky profile.
 * Uses the public AppView API — no authentication required.
 */
export async function getBlueskyPosts(handle: string, limit = 25): Promise<BlueskyPost[]> {
  try {
    const params = new URLSearchParams({
      actor: handle,
      limit: String(limit),
      filter: "posts_and_author_threads",
    });
    const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?${params}`);

    if (!res.ok) {
      console.warn(`[bluesky] API responded ${res.status} for handle "${handle}"`);
      return [];
    }

    const data = await res.json();
    const posts: BlueskyPost[] = [];

    for (const item of data.feed ?? []) {
      const post = item.post;
      if (!post) continue;

      const record = post.record ?? {};

      // Skip reposts — we only want original content from the author
      if (item.reason?.$type === "app.bsky.feed.defs#reasonRepost") continue;

      // Determine reply context
      const isReply = !!record.reply;
      let replyToHandle: string | undefined;
      if (isReply && item.reply?.parent?.author) {
        const parentDid = item.reply.parent.author.did;
        if (parentDid !== post.author.did) {
          replyToHandle = item.reply.parent.author.handle as string;
        }
      }

      // Images
      let images: BlueskyImage[] | undefined;
      const embedType = post.embed?.$type as string | undefined;

      if (embedType === "app.bsky.embed.images#view") {
        images = (post.embed.images ?? []).map((img: Record<string, unknown>) => ({
          thumb: img.thumb as string,
          fullsize: img.fullsize as string,
          alt: (img.alt as string) ?? "",
          aspectRatio: img.aspectRatio as BlueskyImage["aspectRatio"],
        }));
      }

      // recordWithMedia — images + quoted post
      if (embedType === "app.bsky.embed.recordWithMedia#view") {
        const media = post.embed.media as Record<string, unknown> | undefined;
        if (media?.$type === "app.bsky.embed.images#view") {
          images = ((media.images ?? []) as Record<string, unknown>[]).map((img) => ({
            thumb: img.thumb as string,
            fullsize: img.fullsize as string,
            alt: (img.alt as string) ?? "",
            aspectRatio: img.aspectRatio as BlueskyImage["aspectRatio"],
          }));
        }
      }

      // External link card
      let externalLink: BlueskyPost["externalLink"];
      if (embedType === "app.bsky.embed.external#view") {
        const ext = post.embed.external as Record<string, unknown>;
        externalLink = {
          uri: ext.uri as string,
          title: ext.title as string | undefined,
          description: ext.description as string | undefined,
          thumb: ext.thumb as string | undefined,
        };
      }

      // Quoted post
      let quotePost: BlueskyPost["quotePost"];
      const quoteRecord =
        embedType === "app.bsky.embed.record#view"
          ? (post.embed.record as Record<string, unknown>)
          : embedType === "app.bsky.embed.recordWithMedia#view"
            ? (post.embed.record?.record as Record<string, unknown>)
            : undefined;

      if (quoteRecord?.author) {
        const qAuthor = quoteRecord.author as Record<string, unknown>;
        quotePost = {
          url: atUriToUrl(quoteRecord.uri as string, qAuthor.handle as string),
          author: {
            handle: qAuthor.handle as string,
            displayName: qAuthor.displayName as string | undefined,
          },
          text: (quoteRecord.value as Record<string, unknown> | undefined)?.text as string | undefined,
        };
      }

      posts.push({
        uri: post.uri as string,
        url: atUriToUrl(post.uri as string, post.author.handle as string),
        text: (record.text as string) ?? "",
        textHtml: renderFacets((record.text as string) ?? "", record.facets as Facet[] | undefined),
        createdAt: (record.createdAt as string) ?? (post.indexedAt as string),
        author: {
          did: post.author.did as string,
          handle: post.author.handle as string,
          displayName: post.author.displayName as string | undefined,
          avatar: post.author.avatar as string | undefined,
        },
        images,
        externalLink,
        quotePost,
        replyCount: (post.replyCount as number) ?? 0,
        repostCount: (post.repostCount as number) ?? 0,
        likeCount: (post.likeCount as number) ?? 0,
        isReply,
        replyToHandle,
      });
    }

    return posts;
  } catch (err) {
    console.warn("[bluesky] Error fetching posts:", err);
    return [];
  }
}
