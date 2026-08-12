const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lazyVideos = Array.from(document.querySelectorAll("video[data-lazy-video]"));
const loadedVideos = new WeakSet();

const canPlay = (video) => {
  if (reduceMotion) return false;
  if (video.dataset.formatPreview && !video.classList.contains("is-active")) return false;
  return true;
};

const hydrateVideoSources = (video) => {
  video.querySelectorAll("source[data-src]").forEach((source) => {
    if (!source.getAttribute("src")) {
      source.setAttribute("src", source.dataset.src);
    }
  });
};

const playVideo = (video) => {
  if (!canPlay(video)) return;
  if (!loadedVideos.has(video)) {
    hydrateVideoSources(video);
    video.load();
    loadedVideos.add(video);
  }
  video.play().catch(() => {});
};

const pauseVideo = (video) => {
  video.pause();
};

const isInViewport = (video) => {
  const rect = video.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
};

if ("IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          playVideo(video);
        } else {
          pauseVideo(video);
        }
      });
    },
    {
      rootMargin: "0px",
      threshold: 0.08,
    }
  );

  lazyVideos.forEach((video) => videoObserver.observe(video));
} else {
  lazyVideos.forEach(playVideo);
}

const formatVideos = lazyVideos.filter((video) => video.dataset.formatPreview);

if (formatVideos.length) {
  const formatObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      const video = record.target;
      if (video.classList.contains("is-active")) {
        playVideo(video);
      } else {
        pauseVideo(video);
      }
    });
  });

  formatVideos.forEach((video) => {
    formatObserver.observe(video, { attributes: true, attributeFilter: ["class"] });
  });
}

const hero = document.querySelector(".event-hero");
const heroPreviewVideo = document.querySelector("[data-hero-preview-video]");

if (hero && heroPreviewVideo && !reduceMotion) {
  hero.addEventListener(
    "pointerenter",
    () => {
      playVideo(heroPreviewVideo);
    },
    { passive: true }
  );

  hero.addEventListener(
    "pointerleave",
    () => {
      pauseVideo(heroPreviewVideo);
      heroPreviewVideo.currentTime = 0;
    },
    { passive: true }
  );
}

const syncOverlayPlayback = () => {
  const overlayOpen =
    document.body.classList.contains("is-apply-open") ||
    document.body.classList.contains("is-menu-open");

  lazyVideos.forEach((video) => {
    if (overlayOpen) {
      pauseVideo(video);
      return;
    }

    if (isInViewport(video)) {
      playVideo(video);
    }
  });
};

const overlayObserver = new MutationObserver(syncOverlayPlayback);
overlayObserver.observe(document.body, {
  attributes: true,
  attributeFilter: ["class"],
});
