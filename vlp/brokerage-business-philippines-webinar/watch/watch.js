(() => {
  "use strict";

  const config = {
    videoSrc: "",
    durationSeconds: 3388,
    chatEndpoint: "",
    ...(window.QUADCODE_WEBINAR || {}),
  };

  const stage = document.querySelector("#video-stage");
  const video = document.querySelector("#webinar-video");
  const startButton = document.querySelector("#video-start");
  const playToggle = document.querySelector("#play-toggle");
  const muteToggle = document.querySelector("#mute-toggle");
  const fullscreenToggle = document.querySelector("#fullscreen-toggle");
  const progress = document.querySelector("#video-progress");
  const timeLabel = document.querySelector("#video-time");
  const modeLabel = document.querySelector("#video-mode");

  const PLAYER_PROGRESS_KEY = "quadcodePhilippinesWebinarProgress";
  const REGISTRATION_KEY = "quadcodePhilippinesWebinarRegistration";
  const CHAT_KEY = "quadcodePhilippinesWebinarChat";

  const readStorage = (key, fallback = null) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The experience still works when browser storage is unavailable.
    }
  };

  const registration = readStorage(REGISTRATION_KEY, {});
  const viewerFullName =
    [registration.firstName, registration.lastName].filter(Boolean).join(" ") || "Guest";

  const duration = Math.max(1, Number(config.durationSeconds) || 3388);
  const hasVideo = Boolean(config.videoSrc);
  let previewTime = Number(readStorage(PLAYER_PROGRESS_KEY, 0)) || 0;
  let previewPlaying = false;
  let previewFrame = 0;
  let previousFrameTime = 0;
  let lastSavedSecond = -1;

  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const remainingSeconds = safe % 60;

    if (hours > 0) {
      return [hours, minutes, remainingSeconds]
        .map((value) => String(value).padStart(2, "0"))
        .join(":");
    }

    return [minutes, remainingSeconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const currentTime = () => (hasVideo ? video.currentTime || 0 : previewTime);
  const currentDuration = () =>
    hasVideo && Number.isFinite(video.duration) ? video.duration : duration;

  const renderProgress = () => {
    const total = currentDuration();
    const current = Math.min(currentTime(), total);
    const percentage = total ? (current / total) * 100 : 0;
    progress.value = String(percentage);
    progress.style.setProperty("--progress", `${percentage}%`);
    timeLabel.textContent = `${formatTime(current)} / ${formatTime(total)}`;

    const wholeSecond = Math.floor(current);
    if (wholeSecond !== lastSavedSecond && wholeSecond % 5 === 0) {
      writeStorage(PLAYER_PROGRESS_KEY, current);
      lastSavedSecond = wholeSecond;
    }
  };

  const setPlayerState = (state) => {
    stage.dataset.state = state;
    const playing = state === "playing";
    playToggle.setAttribute("aria-label", playing ? "Pause" : "Play");
  };

  const runPreview = (timestamp) => {
    if (!previewPlaying) return;
    if (!previousFrameTime) previousFrameTime = timestamp;

    previewTime += (timestamp - previousFrameTime) / 1000;
    previousFrameTime = timestamp;

    if (previewTime >= duration) {
      previewTime = duration;
      previewPlaying = false;
      previousFrameTime = 0;
      setPlayerState("ended");
      renderProgress();
      return;
    }

    renderProgress();
    previewFrame = window.requestAnimationFrame(runPreview);
  };

  const play = async () => {
    stage.dataset.started = "true";

    if (hasVideo) {
      try {
        await video.play();
      } catch {
        setPlayerState("paused");
        return;
      }
    } else {
      if (previewTime >= duration) previewTime = 0;
      previewPlaying = true;
      previousFrameTime = 0;
      window.cancelAnimationFrame(previewFrame);
      previewFrame = window.requestAnimationFrame(runPreview);
    }

    setPlayerState("playing");
  };

  const pause = () => {
    if (hasVideo) {
      video.pause();
    } else {
      previewPlaying = false;
      previousFrameTime = 0;
      window.cancelAnimationFrame(previewFrame);
    }
    setPlayerState("paused");
    writeStorage(PLAYER_PROGRESS_KEY, currentTime());
  };

  const togglePlayback = () => {
    if (stage.dataset.state === "playing") {
      pause();
    } else {
      play();
    }
  };

  stage.dataset.hasVideo = hasVideo ? "true" : "false";
  modeLabel.textContent = hasVideo ? "Recording" : "Preview mode";

  if (hasVideo) {
    video.src = config.videoSrc;
    video.addEventListener("loadedmetadata", () => {
      const saved = Number(readStorage(PLAYER_PROGRESS_KEY, 0)) || 0;
      if (saved > 0 && saved < video.duration - 5) video.currentTime = saved;
      renderProgress();
    });
    video.addEventListener("timeupdate", renderProgress);
    video.addEventListener("play", () => setPlayerState("playing"));
    video.addEventListener("pause", () => {
      if (!video.ended) setPlayerState("paused");
    });
    video.addEventListener("ended", () => {
      setPlayerState("ended");
      writeStorage(PLAYER_PROGRESS_KEY, 0);
    });
  } else {
    previewTime = Math.min(previewTime, duration - 1);
    renderProgress();
  }

  startButton.addEventListener("click", play);
  playToggle.addEventListener("click", togglePlayback);

  muteToggle.addEventListener("click", () => {
    const muted = muteToggle.getAttribute("aria-pressed") !== "true";
    muteToggle.setAttribute("aria-pressed", String(muted));
    muteToggle.setAttribute("aria-label", muted ? "Unmute" : "Mute");
    if (hasVideo) video.muted = muted;
  });

  progress.addEventListener("input", () => {
    const nextTime = (Number(progress.value) / 100) * currentDuration();
    if (hasVideo) {
      video.currentTime = nextTime;
    } else {
      previewTime = nextTime;
    }
    if (stage.dataset.state === "ready") {
      stage.dataset.started = "true";
      setPlayerState("paused");
    }
    renderProgress();
  });

  fullscreenToggle.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await stage.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen can be blocked by embedded browsers.
    }
  });

  document.addEventListener("fullscreenchange", () => {
    const active = document.fullscreenElement === stage;
    fullscreenToggle.setAttribute(
      "aria-label",
      active ? "Exit fullscreen" : "Enter fullscreen",
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && stage.dataset.state === "playing") pause();
  });

  window.addEventListener("beforeunload", () => {
    writeStorage(PLAYER_PROGRESS_KEY, currentTime());
  });

  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatMessages = document.querySelector("#chat-messages");
  const chatStatus = document.querySelector("#chat-form-status");
  const chatSend = document.querySelector("#chat-send");

  const initials = viewerFullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const appendMessage = (message, shouldScroll = true) => {
    const article = document.createElement("article");
    article.className = "chat-message chat-message--viewer";

    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initials || "G";

    const content = document.createElement("div");
    const header = document.createElement("header");
    const author = document.createElement("strong");
    const time = document.createElement("time");
    const text = document.createElement("p");

    author.textContent = viewerFullName;
    time.dateTime = message.sentAt;
    time.textContent = new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(message.sentAt));
    text.textContent = message.text;

    header.append(author, time);
    content.append(header, text);
    article.append(avatar, content);
    chatMessages.append(article);

    if (shouldScroll) {
      chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
  };

  const savedMessages = readStorage(CHAT_KEY, []);
  if (Array.isArray(savedMessages)) {
    savedMessages.slice(-30).forEach((message) => appendMessage(message, false));
  }

  const resizeChatInput = () => {
    chatInput.style.height = "auto";
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 112)}px`;
  };

  chatInput.addEventListener("input", resizeChatInput);
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      chatForm.requestSubmit();
    }
  });

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const value = chatInput.value.trim();
    if (!value) {
      chatInput.focus();
      return;
    }

    const message = {
      id:
        typeof window.crypto?.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: value,
      sentAt: new Date().toISOString(),
      viewer: {
        name: viewerFullName,
        email: registration.email || "",
        company: registration.company || "",
      },
    };

    const stored = readStorage(CHAT_KEY, []);
    const nextMessages = [
      ...(Array.isArray(stored) ? stored : []).slice(-29),
      message,
    ];
    writeStorage(CHAT_KEY, nextMessages);
    appendMessage(message);

    chatInput.value = "";
    resizeChatInput();
    chatSend.disabled = true;
    chatStatus.textContent = "";

    window.dispatchEvent(
      new CustomEvent("quadcode:webinar-chat-send", {
        detail: message,
      }),
    );

    if (!config.chatEndpoint) {
      chatStatus.textContent = "Message saved in this browser.";
      chatSend.disabled = false;
      chatInput.focus();
      return;
    }

    try {
      const response = await fetch(config.chatEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      if (!response.ok) throw new Error("Chat request failed");
      chatStatus.textContent = "Message sent to the Quadcode team.";
    } catch {
      chatStatus.textContent =
        "Message saved locally; delivery could not be confirmed.";
      chatStatus.style.color = "#c71929";
    } finally {
      chatSend.disabled = false;
      chatInput.focus();
    }
  });
})();
