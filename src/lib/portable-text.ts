import { toHTML } from "@portabletext/to-html";
import { urlFor, getFileUrl } from "./sanity";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface PortableTextBlock {
  _type: string;
  [key: string]: any;
}

export function renderPortableText(blocks: PortableTextBlock[]): string {
  return toHTML(blocks, {
    components: {
      types: {
        image: ({ value }) => {
          const src = urlFor(value as SanityImageSource)
            .width(1200)
            .auto("format")
            .url();
          const srcset = [
            `${urlFor(value as SanityImageSource).width(400).auto("format").url()} 400w`,
            `${urlFor(value as SanityImageSource).width(800).auto("format").url()} 800w`,
            `${urlFor(value as SanityImageSource).width(1200).auto("format").url()} 1200w`,
          ].join(", ");

          const alt = value.alt || "";
          const caption = value.caption || "";

          let html = `<figure>`;
          html += `<img src="${src}" srcset="${srcset}" sizes="(max-width: 768px) 100vw, 800px" alt="${alt}" loading="lazy" decoding="async" data-lightbox data-lightbox-group="post" data-lightbox-src="${src}" />`;
          if (caption) {
            html += `<figcaption>${caption}</figcaption>`;
          }
          html += `</figure>`;
          return html;
        },

        videoEmbed: ({ value }) => {
          const videoUrl = value.video?.asset?._ref
            ? getFileUrl(value.video.asset._ref)
            : value.video?.asset?.url || "";

          const posterUrl = value.poster
            ? urlFor(value.poster as SanityImageSource)
                .width(1200)
                .auto("format")
                .url()
            : "";

          const caption = value.caption || "";

          // VideoPlayer is a client component, so we output raw HTML that matches its structure
          let html = `<figure class="video-player">`;
          html += `<div class="video-wrapper">`;
          html += `<video src="${videoUrl}"${posterUrl ? ` poster="${posterUrl}"` : ""} playsinline preload="metadata" class="video-element"><track kind="captions" /></video>`;
          html += `<div class="video-controls">`;
          html += `<button class="video-btn video-play-btn" type="button" aria-label="Play video"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path class="play-icon" d="M6 4l10 6-10 6V4z" fill="currentColor"/><g class="pause-icon" style="display:none"><rect x="5" y="4" width="3.5" height="12" fill="currentColor"/><rect x="11.5" y="4" width="3.5" height="12" fill="currentColor"/></g></svg></button>`;
          html += `<div class="video-progress"><div class="video-progress-bar"></div></div>`;
          html += `<button class="video-btn video-mute-btn" type="button" aria-label="Toggle mute"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 6.5h3l4-3.5v12l-4-3.5H2v-5z" fill="currentColor"/><path class="volume-waves" d="M12 6.5a3.5 3.5 0 010 5M13.5 4a6.5 6.5 0 010 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><line class="mute-line" x1="2" y1="16" x2="16" y2="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="display:none"/></svg></button>`;
          html += `</div></div>`;
          if (caption) {
            html += `<figcaption>${caption}</figcaption>`;
          }
          html += `</figure>`;
          return html;
        },

        gallery: ({ value }) => {
          const layout = value.layout || "grid";
          const images = value.images || [];

          if (layout === "carousel") {
            // Carousel rendered as grid fallback in static HTML — carousel JS enhances if present
            let html = `<div class="carousel" role="region" aria-label="Image gallery" tabindex="0"><div class="carousel-track">`;
            images.forEach((img: any, i: number) => {
              const src = urlFor(img as SanityImageSource)
                .width(1200)
                .auto("format")
                .url();
              html += `<div class="carousel-slide" data-index="${i}">`;
              html += `<img src="${src}" alt="${img.alt || ""}" loading="lazy" decoding="async" data-lightbox data-lightbox-group="gallery" data-lightbox-src="${src}" />`;
              if (img.caption) {
                html += `<p class="carousel-caption">${img.caption}</p>`;
              }
              html += `</div>`;
            });
            html += `</div>`;
            if (images.length > 1) {
              html += `<button class="carousel-btn carousel-prev" type="button" aria-label="Previous"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 16 7 10 13 4"/></svg></button>`;
              html += `<button class="carousel-btn carousel-next" type="button" aria-label="Next"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 4 13 10 7 16"/></svg></button>`;
              html += `<div class="carousel-dots">`;
              images.forEach((_: any, i: number) => {
                html += `<button class="carousel-dot${i === 0 ? " is-active" : ""}" type="button" aria-label="Go to slide ${i + 1}" data-index="${i}"></button>`;
              });
              html += `</div>`;
            }
            html += `</div>`;
            return html;
          }

          // Grid layout
          let html = `<div class="gallery-grid">`;
          images.forEach((img: any) => {
            const src = urlFor(img as SanityImageSource)
              .width(800)
              .auto("format")
              .url();
            const fullSrc = urlFor(img as SanityImageSource)
              .width(1600)
              .auto("format")
              .url();
            html += `<figure class="gallery-item">`;
            html += `<img src="${src}" alt="${img.alt || ""}" loading="lazy" decoding="async" data-lightbox data-lightbox-group="gallery" data-lightbox-src="${fullSrc}" />`;
            if (img.caption) {
              html += `<figcaption>${img.caption}</figcaption>`;
            }
            html += `</figure>`;
          });
          html += `</div>`;
          return html;
        },
      },

      marks: {
        link: ({ children, value }) => {
          const href = value?.href || "#";
          const isExternal =
            href.startsWith("http") && !href.includes("nicklasjakobsen.dk");
          return `<a href="${href}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}>${children}</a>`;
        },
      },
    },
  });
}
