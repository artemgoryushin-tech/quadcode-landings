const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lazyVideos = Array.from(document.querySelectorAll("video[data-lazy-video]"));

const canPlay = (video) => {
  if (reduceMotion) return false;
  if (video.dataset.formatPreview && !video.classList.contains("is-active")) return false;
  return true;
};

const playVideo = (video) => {
  if (!canPlay(video)) return;
  video.load();
  video.play().catch(() => {});
};

const pauseVideo = (video) => {
  video.pause();
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
