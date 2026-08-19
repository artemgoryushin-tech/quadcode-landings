(() => {
  "use strict";

  const SESSION_HOUR_UTC = 9;
  const STARTING_WINDOW_MS = 60 * 1000;
  const SESSION_TIME_LABEL = "5:00 PM PHT";

  const asDate = (input) =>
    input instanceof Date ? new Date(input.getTime()) : new Date(input);

  const getNextSession = (nowInput = new Date()) => {
    const now = asDate(nowInput);
    const session = new Date(now.getTime());

    session.setUTCHours(SESSION_HOUR_UTC, 0, 0, 0);

    if (now.getTime() > session.getTime() + STARTING_WINDOW_MS) {
      session.setUTCDate(session.getUTCDate() + 1);
    }

    return session;
  };

  const getRemaining = (targetInput, nowInput = new Date()) => {
    const target = asDate(targetInput);
    const now = asDate(nowInput);
    const totalSeconds = Math.max(
      0,
      Math.floor((target.getTime() - now.getTime()) / 1000),
    );

    return {
      totalSeconds,
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  };

  const pad = (number) => String(number).padStart(2, "0");
  const formatSessionLabel = (sessionInput = getNextSession()) => {
    try {
      const localTime = new Intl.DateTimeFormat("fil-PH", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(asDate(sessionInput));
      return `${localTime} · oras mo`;
    } catch {
      return SESSION_TIME_LABEL;
    }
  };

  const initCountdown = (root) => {
    const heading = root.querySelector("[data-countdown-heading]");
    const sessionLabel = root.querySelector("[data-session-label]");
    const clock = root.querySelector('[role="timer"]');
    const hours = root.querySelector("[data-countdown-hours]");
    const minutes = root.querySelector("[data-countdown-minutes]");
    const seconds = root.querySelector("[data-countdown-seconds]");

    if (!heading || !sessionLabel || !clock || !hours || !minutes || !seconds) {
      return;
    }

    const update = () => {
      const now = new Date();
      const target = getNextSession(now);
      const remaining = getRemaining(target, now);
      const isStarting = remaining.totalSeconds === 0;

      heading.textContent = isStarting
        ? "Magsisimula na ang webinar"
        : "Magsisimula ang susunod na webinar sa";
      sessionLabel.textContent = formatSessionLabel(target);
      hours.textContent = pad(remaining.hours);
      minutes.textContent = pad(remaining.minutes);
      seconds.textContent = pad(remaining.seconds);
      root.dataset.sessionTarget = target.toISOString();
      clock.setAttribute(
        "aria-label",
        isStarting
          ? `Magsisimula ang webinar nang ${formatSessionLabel(target)}`
          : `${remaining.hours} oras, ${remaining.minutes} minuto, at ${remaining.seconds} segundo bago magsimula ang susunod na webinar`,
      );
    };

    update();
    globalThis.setInterval(update, 1000);
  };

  globalThis.QuadcodeWebinarSchedule = {
    formatSessionLabel,
    getNextSession,
    getRemaining,
  };

  if (typeof document !== "undefined") {
    document
      .querySelectorAll("[data-session-countdown]")
      .forEach((root) => initCountdown(root));
  }
})();
