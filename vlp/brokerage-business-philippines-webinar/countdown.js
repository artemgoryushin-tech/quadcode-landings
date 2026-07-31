(() => {
  "use strict";

  const SESSION_HOUR_UTC = 9;
  const STARTING_WINDOW_MS = 60 * 1000;
  const SESSION_TIME_LABEL = "12:00 GMT+3";

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
  const formatSessionLabel = () => SESSION_TIME_LABEL;

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
        ? "The webinar is starting"
        : "Next webinar starts in";
      sessionLabel.textContent = SESSION_TIME_LABEL;
      hours.textContent = pad(remaining.hours);
      minutes.textContent = pad(remaining.minutes);
      seconds.textContent = pad(remaining.seconds);
      root.dataset.sessionTarget = target.toISOString();
      clock.setAttribute(
        "aria-label",
        isStarting
          ? `The webinar is starting at ${SESSION_TIME_LABEL}`
          : `${remaining.hours} hours, ${remaining.minutes} minutes, and ${remaining.seconds} seconds until the next webinar`,
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
