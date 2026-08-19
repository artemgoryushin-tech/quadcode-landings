(() => {
  "use strict";

  const config = {
    videoSrc: "",
    durationSeconds: 1343.4,
    sessionHourUtc: 9,
    sessionTimeLabel: "5:00 PM PHT",
    chatEndpoint: "",
    timedChat: [],
    ...(window.QUADCODE_WEBINAR || {}),
  };

  const stage = document.querySelector("#video-stage");
  const video = document.querySelector("#webinar-video");
  const startButton = document.querySelector("#video-start");
  const startTitle = document.querySelector("#video-start-title");
  const startCountdown = document.querySelector("#video-start-countdown");
  const startNote = document.querySelector("#video-start-note");
  const muteToggle = document.querySelector("#mute-toggle");
  const captionsToggle = document.querySelector("#captions-toggle");
  const fullscreenToggle = document.querySelector("#fullscreen-toggle");
  const videoControls = document.querySelector("#video-controls");
  const progress = document.querySelector("#video-progress");
  const progressFill = progress?.querySelector("span");
  const timeLabel = document.querySelector("#video-time");
  const modeLabel = document.querySelector("#video-mode");
  const modeText = modeLabel?.querySelector("span");
  const viewerCount = document.querySelector("#viewer-count");
  const presenceLabel = document.querySelector("#presence-label");
  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatMessages = document.querySelector("#chat-messages");
  const chatStatus = document.querySelector("#chat-form-status");
  const chatSend = document.querySelector("#chat-send");

  if (
    !stage ||
    !video ||
    !startButton ||
    !startTitle ||
    !startCountdown ||
    !startNote ||
    !muteToggle ||
    !captionsToggle ||
    !fullscreenToggle ||
    !videoControls ||
    !progress ||
    !progressFill ||
    !timeLabel ||
    !modeLabel ||
    !modeText ||
    !viewerCount ||
    !presenceLabel ||
    !chatForm ||
    !chatInput ||
    !chatMessages ||
    !chatStatus ||
    !chatSend ||
    !globalThis.QuadcodeLiveSchedule?.create
  ) {
    return;
  }

  const REGISTRATION_KEY = "quadcodePhilippinesMarketsWebinarRegistration";
  const CHAT_KEY = "quadcodePhilippinesMarketsWebinarChat";
  const CAPTIONS_KEY = "quadcodePhilippinesMarketsWebinarCaptions";
  const duration = Math.max(1, Number(config.durationSeconds) || 1404.884);
  const hasVideo = Boolean(config.videoSrc);
  const schedule = globalThis.QuadcodeLiveSchedule.create({
    sessionHourUtc: config.sessionHourUtc,
    durationSeconds: duration,
  });
  const timedMessages = Array.isArray(config.timedChat)
    ? [...config.timedChat]
        .filter(
          (message) =>
            message &&
            Number.isFinite(Number(message.at)) &&
            message.id &&
            message.name &&
            message.text,
        )
        .sort((first, second) => Number(first.at) - Number(second.at))
    : [];

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
      // The live experience still works when browser storage is unavailable.
    }
  };

  const registration =
    globalThis.QuadcodeWebinarTracking?.readRegistration?.() ||
    readStorage(REGISTRATION_KEY, {});
  const viewerFullName =
    [registration.firstName, registration.lastName].filter(Boolean).join(" ") ||
    "Guest";
  const isLocalPreview =
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const previewOffsetParam = new URLSearchParams(window.location.search).get(
    "liveAt",
  );
  const requestedPreviewOffset = Number(previewOffsetParam);
  const hasPreviewClock =
    isLocalPreview &&
    previewOffsetParam !== null &&
    Number.isFinite(requestedPreviewOffset);
  const previewClockStartedAt = Date.now();
  const previewSessionStart = new Date();
  previewSessionStart.setUTCHours(Number(config.sessionHourUtc) || 9, 0, 0, 0);

  const currentDate = () => {
    if (!hasPreviewClock) return new Date();
    return new Date(
      previewSessionStart.getTime() +
        requestedPreviewOffset * 1000 +
        (Date.now() - previewClockStartedAt),
    );
  };

  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const remainingSeconds = safe % 60;
    const values = hours > 0
      ? [hours, minutes, remainingSeconds]
      : [minutes, remainingSeconds];

    return values
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const formatCountdown = (milliseconds) => {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const formatLocalSessionTime = (sessionDate) => {
    try {
      const localTime = new Intl.DateTimeFormat("fil-PH", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(sessionDate);
      return `${localTime} · oras mo`;
    } catch {
      return config.sessionTimeLabel;
    }
  };

  const initialsFor = (name, fallback = "A") =>
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || fallback;

  const isNearChatBottom = () =>
    chatMessages.scrollHeight -
      chatMessages.scrollTop -
      chatMessages.clientHeight <
    96;

  const scrollChatToLatest = () => {
    // Live chats stay pinned to the newest message. Smooth scrolling here makes
    // rapid replies feel like the whole panel is floating and repeatedly
    // restarting an animation.
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const appendTimedMessage = (message) => {
    const article = document.createElement("article");
    article.className = "chat-message chat-message--timed";
    article.dataset.timedId = message.id;

    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initialsFor(message.name);

    const content = document.createElement("div");
    const header = document.createElement("header");
    const author = document.createElement("strong");
    const location = document.createElement("span");
    const time = document.createElement("time");
    const text = document.createElement("p");

    author.textContent = message.name;
    location.textContent = message.location || "Attendee";
    time.textContent = formatTime(message.at);
    text.textContent = message.text;

    header.append(author, location, time);
    content.append(header, text);
    article.append(avatar, content);
    chatMessages.append(article);
  };

  const appendViewerMessage = (message, shouldScroll = true) => {
    const article = document.createElement("article");
    article.className = "chat-message chat-message--viewer";
    article.dataset.viewerMessageId = message.id;

    const avatar = document.createElement("span");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = initialsFor(viewerFullName, "I");

    const content = document.createElement("div");
    const header = document.createElement("header");
    const author = document.createElement("strong");
    const time = document.createElement("time");
    const text = document.createElement("p");

    author.textContent = viewerFullName;
    time.dateTime = message.sentAt;
    time.textContent = new Intl.DateTimeFormat("fil-PH", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(message.sentAt));
    text.textContent = message.text;

    header.append(author, time);
    content.append(header, text);
    article.append(avatar, content);
    chatMessages.append(article);

    if (shouldScroll) scrollChatToLatest();
  };

  let currentSessionKey = "";
  let hasJoined = false;
  let internalSeek = false;
  let latestSessionState = schedule.getState(currentDate());
  let initialChatSync = true;
  let suppressResume = false;
  let autoJoinPending = false;
  let controlsHideTimer = 0;
  let keyboardControlsPinned = false;
  let attendanceSessionKey = "";
  let watchedSeconds = 0;
  let lastAttendanceTick = performance.now();
  let lastSentWatchedSeconds = 0;
  let joinedEventSessionKey = "";
  const ATTENDANCE_KEY = "quadcodePhilippinesMarketsWebinarAttendance";
  const ATTENDANCE_HEARTBEAT_SECONDS = 30;
  const ATTENDANCE_THRESHOLD_SECONDS = 60;
  const attendanceHistory = readStorage(ATTENDANCE_KEY, {});

  const saveAttendanceProgress = () => {
    if (!attendanceSessionKey) return;
    attendanceHistory[attendanceSessionKey] = {
      watchedSeconds: Math.floor(watchedSeconds),
      updatedAt: new Date().toISOString(),
    };
    writeStorage(ATTENDANCE_KEY, attendanceHistory);
  };

  const loadAttendanceSession = (sessionKey) => {
    attendanceSessionKey = sessionKey;
    watchedSeconds = Math.max(
      0,
      Number(attendanceHistory[sessionKey]?.watchedSeconds) || 0,
    );
    lastSentWatchedSeconds = watchedSeconds;
    lastAttendanceTick = performance.now();
  };

  const sendAttendance = (eventName) => {
    if (
      !registration.registrationId ||
      !globalThis.QuadcodeWebinarTracking?.attendance ||
      !attendanceSessionKey
    ) {
      return;
    }

    lastSentWatchedSeconds = Math.floor(watchedSeconds);
    saveAttendanceProgress();
    void globalThis.QuadcodeWebinarTracking.attendance({
      event: eventName,
      watchedSeconds,
      actualSessionStart: attendanceSessionKey,
      occurredAt: new Date().toISOString(),
    }).catch(() => {
      // The tracking module keeps the latest cumulative event for retry.
    });
  };

  const isActivelyWatching = () =>
    hasJoined &&
    latestSessionState.state === "live" &&
    !document.hidden &&
    !video.paused &&
    !video.ended &&
    video.readyState >= 2;

  const updateAttendance = () => {
    const now = performance.now();
    const elapsedSeconds = Math.min(3, Math.max(0, (now - lastAttendanceTick) / 1000));
    lastAttendanceTick = now;
    if (!isActivelyWatching()) return;

    const previousSeconds = watchedSeconds;
    watchedSeconds += elapsedSeconds;
    const crossedAttendanceThreshold =
      previousSeconds < ATTENDANCE_THRESHOLD_SECONDS &&
      watchedSeconds >= ATTENDANCE_THRESHOLD_SECONDS;
    const heartbeatDue =
      watchedSeconds - lastSentWatchedSeconds >= ATTENDANCE_HEARTBEAT_SECONDS;

    if (crossedAttendanceThreshold || heartbeatDue) {
      sendAttendance("heartbeat");
    } else if (Math.floor(watchedSeconds) % 10 === 0) {
      saveAttendanceProgress();
    }
  };

  const renderStoredMessages = () => {
    chatMessages
      .querySelectorAll("[data-viewer-message-id]")
      .forEach((message) => message.remove());

    const savedMessages = readStorage(CHAT_KEY, []);
    if (!Array.isArray(savedMessages)) return;
    savedMessages
      .filter((message) => message.sessionKey === currentSessionKey)
      .slice(-30)
      .forEach((message) => appendViewerMessage(message, false));
  };

  const switchSession = (sessionKey) => {
    if (sessionKey === currentSessionKey) return;
    currentSessionKey = sessionKey;
    loadAttendanceSession(sessionKey);
    chatMessages
      .querySelectorAll("[data-timed-id]")
      .forEach((message) => message.remove());
    renderStoredMessages();
    initialChatSync = true;
  };

  const syncTimedChat = (playbackTime) => {
    const time = Math.max(0, Number(playbackTime) || 0);
    const shouldStick = initialChatSync || isNearChatBottom();
    const existingMessages = new Map(
      [...chatMessages.querySelectorAll("[data-timed-id]")].map((element) => [
        element.dataset.timedId,
        element,
      ]),
    );
    const dueMessages = timedMessages.filter(
      (message) => time >= Number(message.at),
    );
    const dueIds = new Set(dueMessages.map((message) => message.id));
    const isLargeBatch = initialChatSync && dueMessages.length > 8;
    let changed = false;

    if (isLargeBatch) chatMessages.setAttribute("aria-live", "off");

    existingMessages.forEach((element, id) => {
      if (!dueIds.has(id)) {
        element.remove();
        changed = true;
      }
    });

    dueMessages.forEach((message) => {
      if (!existingMessages.has(message.id)) {
        appendTimedMessage(message);
        changed = true;
      }
    });

    if (changed && shouldStick) scrollChatToLatest();

    if (isLargeBatch) {
      window.setTimeout(() => chatMessages.setAttribute("aria-live", "polite"), 0);
    }
    initialChatSync = false;
  };

  const renderProgress = (offsetSeconds) => {
    const current = Math.min(Math.max(0, offsetSeconds), duration);
    const percentage = Math.min(100, (current / duration) * 100);
    progress.style.setProperty("--progress", `${percentage}%`);
    progressFill.style.width = `${percentage}%`;
    progress.setAttribute("aria-valuenow", String(Math.round(percentage)));
    progress.setAttribute(
      "aria-valuetext",
      `${formatTime(current)} ng ${formatTime(duration)}`,
    );
    timeLabel.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  };

  const setMode = (state, label) => {
    stage.dataset.liveState = state;
    document.body.dataset.webinarState = state;
    modeText.textContent = label;
  };

  const viewersFor = (offsetSeconds) => {
    const offset = Math.max(0, Number(offsetSeconds) || 0);
    const growth = Math.min(28, Math.floor(offset / 42));
    const movement = Math.round(Math.sin(offset / 19) * 3);
    return Math.max(112, 118 + growth + movement);
  };

  const setChatAvailability = (isLive) => {
    chatInput.disabled = !isLive;
    chatSend.disabled = !isLive;
    chatInput.placeholder = isLive
      ? "Magtanong sa Quadcode team…"
      : "Magbubukas ang chat kapag nagsimula ang session";
  };

  const setControlsVisible = (isVisible) => {
    const visible = Boolean(
      isVisible && hasJoined && latestSessionState.state === "live",
    );
    stage.dataset.controlsVisible = String(visible);
    videoControls.setAttribute("aria-hidden", String(!visible));
  };

  const clearControlsTimer = () => {
    if (!controlsHideTimer) return;
    window.clearTimeout(controlsHideTimer);
    controlsHideTimer = 0;
  };

  const hideControls = () => {
    clearControlsTimer();
    if (
      (keyboardControlsPinned && videoControls.contains(document.activeElement)) ||
      (window.matchMedia("(hover: hover)").matches && videoControls.matches(":hover"))
    ) {
      controlsHideTimer = window.setTimeout(hideControls, 900);
      return;
    }
    setControlsVisible(false);
  };

  const showControls = ({ autoHide = true } = {}) => {
    if (!hasJoined || latestSessionState.state !== "live") return;
    clearControlsTimer();
    setControlsVisible(true);
    if (autoHide) controlsHideTimer = window.setTimeout(hideControls, 2600);
  };

  const setPlayerControlsAvailability = (isAvailable) => {
    muteToggle.disabled = !isAvailable;
    fullscreenToggle.disabled = !isAvailable;
    if (subtitleElement) captionsToggle.disabled = !isAvailable;
    if (!isAvailable) {
      clearControlsTimer();
      setControlsVisible(false);
    }
  };

  const seekToLivePoint = (offsetSeconds) => {
    if (!hasVideo || video.readyState < 1) return;
    const target = Math.min(Math.max(0, offsetSeconds), Math.max(0, video.duration - 0.1));
    if (Math.abs(video.currentTime - target) < 0.35) return;
    internalSeek = true;
    video.currentTime = target;
  };

  const ensureLivePlayback = async () => {
    if (!hasJoined || latestSessionState.state !== "live" || !video.paused) return;
    try {
      await video.play();
      if (joinedEventSessionKey !== currentSessionKey) {
        joinedEventSessionKey = currentSessionKey;
        sendAttendance("joined");
      }
      showControls();
    } catch {
      // A user gesture may be required again by the browser.
      hasJoined = false;
      stage.dataset.started = "false";
      stage.dataset.state = "ready";
      startButton.removeAttribute("aria-hidden");
    }
  };

  const updateSession = ({ forceMediaSync = false } = {}) => {
    latestSessionState = schedule.getState(currentDate());
    const sessionKey = latestSessionState.start.toISOString();
    switchSession(sessionKey);

    const chatTime =
      latestSessionState.state === "upcoming"
        ? 0
        : latestSessionState.offsetSeconds;
    renderProgress(chatTime);
    syncTimedChat(chatTime);

    if (latestSessionState.state === "live") {
      const liveOffset = latestSessionState.offsetSeconds;
      setMode("live", "Live");
      viewerCount.hidden = false;
      viewerCount.textContent = String(viewersFor(liveOffset));
      presenceLabel.textContent = "live";
      setChatAvailability(true);
      startButton.disabled = false;
      startButton.setAttribute("aria-label", "Sumali sa live webinar");
      startTitle.textContent = "Sumali sa webinar";
      startCountdown.hidden = true;
      startNote.textContent = `Live · ${formatTime(liveOffset)} na ang lumipas`;

      if (!hasJoined) {
        stage.dataset.started = "false";
        stage.dataset.state = "ready";
        setPlayerControlsAvailability(false);
        startButton.removeAttribute("aria-hidden");
        seekToLivePoint(liveOffset);
        if (hasVideo && video.readyState >= 1 && !autoJoinPending) {
          void joinLive({ muted: true, automatic: true });
        }
        return;
      }

      stage.dataset.started = "true";
      stage.dataset.state = "playing";
      setPlayerControlsAvailability(true);
      startButton.setAttribute("aria-hidden", "true");
      if (
        forceMediaSync ||
        Math.abs(video.currentTime - liveOffset) > 1.5
      ) {
        seekToLivePoint(liveOffset);
      }
      void ensureLivePlayback();
      return;
    }

    suppressResume = true;
    hasJoined = false;
    video.pause();
    stage.dataset.started = "false";
    startButton.removeAttribute("aria-hidden");
    startButton.disabled = true;
    setPlayerControlsAvailability(false);
    setChatAvailability(false);

    if (latestSessionState.state === "upcoming") {
      stage.dataset.state = "waiting";
      setMode("upcoming", "Susunod na session");
      viewerCount.hidden = false;
      viewerCount.textContent = "104";
      presenceLabel.textContent = "naghihintay";
      const countdown = formatCountdown(latestSessionState.millisecondsUntilStart);
      const localStartTime = formatLocalSessionTime(latestSessionState.start);
      startTitle.textContent = "Magsisimula sa loob ng";
      startCountdown.hidden = false;
      startCountdown.textContent = countdown;
      startNote.textContent = localStartTime;
      startButton.setAttribute(
        "aria-label",
        `Magsisimula ang webinar sa loob ng ${countdown}, nang ${localStartTime}`,
      );
      seekToLivePoint(0);
    } else {
      stage.dataset.state = "closed";
      setMode("ended", "Tapos na ang session");
      viewerCount.hidden = true;
      presenceLabel.textContent = "tapos na ang session";
      const countdown = formatCountdown(latestSessionState.millisecondsUntilStart);
      const localStartTime = formatLocalSessionTime(latestSessionState.nextStart);
      startTitle.textContent = "Susunod na session sa loob ng";
      startCountdown.hidden = false;
      startCountdown.textContent = countdown;
      startNote.textContent = localStartTime;
      startButton.setAttribute(
        "aria-label",
        `Magsisimula ang susunod na session sa loob ng ${countdown}, nang ${localStartTime}`,
      );
    }

    window.setTimeout(() => {
      suppressResume = false;
    }, 0);
  };

  async function joinLive({ muted = false, automatic = false } = {}) {
    const sessionState = schedule.getState(currentDate());
    if (sessionState.state !== "live" || !hasVideo || autoJoinPending) return;

    autoJoinPending = automatic;
    latestSessionState = sessionState;
    hasJoined = true;
    stage.dataset.started = "true";
    stage.dataset.state = "playing";
    setPlayerControlsAvailability(true);
    startButton.setAttribute("aria-hidden", "true");
    video.muted = muted;
    muteToggle.setAttribute("aria-pressed", String(muted));
    muteToggle.setAttribute("aria-label", muted ? "I-on ang tunog" : "I-mute");
    seekToLivePoint(sessionState.offsetSeconds);

    try {
      await video.play();
      if (joinedEventSessionKey !== currentSessionKey) {
        joinedEventSessionKey = currentSessionKey;
        sendAttendance("joined");
      }
      showControls();
    } catch {
      hasJoined = false;
      stage.dataset.started = "false";
      stage.dataset.state = "ready";
      setPlayerControlsAvailability(false);
      startButton.removeAttribute("aria-hidden");
    } finally {
      autoJoinPending = false;
    }
  }

  stage.dataset.hasVideo = hasVideo ? "true" : "false";

  const subtitleElement = video.querySelector('track[kind="subtitles"]');
  let captionsEnabled = readStorage(CAPTIONS_KEY, true) !== false;
  const setCaptions = (enabled) => {
    captionsEnabled = Boolean(enabled);
    const textTrack = video.textTracks?.[0];
    if (textTrack) textTrack.mode = captionsEnabled ? "showing" : "hidden";
    captionsToggle.setAttribute("aria-pressed", String(captionsEnabled));
    captionsToggle.setAttribute(
      "aria-label",
      captionsEnabled ? "I-off ang captions" : "I-on ang captions",
    );
    writeStorage(CAPTIONS_KEY, captionsEnabled);
  };

  if (subtitleElement) {
    subtitleElement.addEventListener("load", () => setCaptions(captionsEnabled));
    captionsToggle.addEventListener("click", () => setCaptions(!captionsEnabled));
    setCaptions(captionsEnabled);
  } else {
    captionsToggle.disabled = true;
    captionsToggle.hidden = true;
  }

  setPlayerControlsAvailability(false);

  if (hasVideo) {
    video.playbackRate = 1;
    video.addEventListener("loadedmetadata", () =>
      updateSession({ forceMediaSync: true }),
    );
    video.addEventListener("seeked", () => {
      internalSeek = false;
    });
    video.addEventListener("seeking", () => {
      if (!internalSeek && latestSessionState.state === "live") {
        seekToLivePoint(latestSessionState.offsetSeconds);
      }
    });
    video.addEventListener("ratechange", () => {
      if (video.playbackRate !== 1) video.playbackRate = 1;
    });
    video.addEventListener("pause", () => {
      if (!suppressResume && hasJoined && latestSessionState.state === "live") {
        window.setTimeout(() => void ensureLivePlayback(), 0);
      }
    });
    video.src = config.videoSrc;
  } else {
    startButton.disabled = true;
    startTitle.textContent = "Hindi available ang video";
    startCountdown.hidden = true;
    startNote.textContent = "Pakisubukan ulit mamaya";
  }

  startButton.addEventListener("click", () => void joinLive({ muted: false }));

  stage.addEventListener("pointerdown", () => {
    keyboardControlsPinned = false;
  });

  stage.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse") showControls();
  });

  stage.addEventListener("pointerup", (event) => {
    if (
      event.pointerType === "mouse" ||
      event.target.closest("button") ||
      event.target.closest(".video-controls") ||
      !hasJoined ||
      latestSessionState.state !== "live"
    ) {
      return;
    }

    if (stage.dataset.controlsVisible === "true") hideControls();
    else showControls();
  });

  stage.addEventListener("keydown", (event) => {
    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target === stage &&
      hasJoined
    ) {
      event.preventDefault();
      keyboardControlsPinned = true;
      showControls({ autoHide: false });
      muteToggle.focus();
    }
  });

  videoControls.addEventListener("focusin", () => {
    showControls({ autoHide: !keyboardControlsPinned });
  });
  videoControls.addEventListener("focusout", () => {
    window.setTimeout(() => {
      if (videoControls.contains(document.activeElement)) return;
      keyboardControlsPinned = false;
      showControls();
    }, 0);
  });

  muteToggle.addEventListener("click", () => {
    const muted = !video.muted;
    video.muted = muted;
    muteToggle.setAttribute("aria-pressed", String(muted));
    muteToggle.setAttribute("aria-label", muted ? "I-on ang tunog" : "I-mute");
    showControls();
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
      active ? "Lumabas sa fullscreen" : "Buksan ang fullscreen",
    );
    showControls();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      sendAttendance("heartbeat");
      lastAttendanceTick = performance.now();
      return;
    }
    lastAttendanceTick = performance.now();
    updateSession({ forceMediaSync: true });
  });

  window.addEventListener("pagehide", () => sendAttendance("leave"));

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
    if (!value || latestSessionState.state !== "live") {
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
      videoTime: latestSessionState.offsetSeconds,
      sessionKey: currentSessionKey,
      viewer: {
        name: viewerFullName,
        email: registration.email || "",
        company: registration.company || "",
      },
    };
    const stored = readStorage(CHAT_KEY, []);
    const nextMessages = [
      ...(Array.isArray(stored) ? stored : []).slice(-49),
      message,
    ];
    writeStorage(CHAT_KEY, nextMessages);
    appendViewerMessage(message);

    chatInput.value = "";
    resizeChatInput();
    chatSend.disabled = true;
    chatStatus.textContent = "";
    chatStatus.style.color = "";

    window.dispatchEvent(
      new CustomEvent("quadcode:webinar-chat-send", { detail: message }),
    );

    if (!config.chatEndpoint) {
      chatStatus.textContent = "Naka-save ang message sa browser na ito.";
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
      if (!response.ok) throw new Error("Could not send the message");
      chatStatus.textContent = "Naipadala ang message sa Quadcode team.";
    } catch {
      chatStatus.textContent =
        "Naka-save ang message sa browser, pero hindi makumpirma ang delivery.";
      chatStatus.style.color = "#c71929";
    } finally {
      chatSend.disabled = false;
      chatInput.focus();
    }
  });

  updateSession({ forceMediaSync: true });
  globalThis.setInterval(() => {
    const state = schedule.getState(currentDate());
    syncTimedChat(state.state === "upcoming" ? 0 : state.offsetSeconds);
  }, 200);
  globalThis.setInterval(() => updateSession(), 1000);
  globalThis.setInterval(updateAttendance, 1000);

  globalThis.QuadcodeLiveWebinar = {
    formatTime,
    getSessionState: () => schedule.getState(currentDate()),
    messageCount: timedMessages.length,
  };
})();
