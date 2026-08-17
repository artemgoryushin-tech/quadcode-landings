(() => {
  "use strict";

  const create = ({ sessionHourUtc = 16, durationSeconds = 1343.4 } = {}) => {
    const hourUtc = Math.min(23, Math.max(0, Number(sessionHourUtc) || 0));
    const durationMs = Math.max(1, Number(durationSeconds) || 1) * 1000;

    const sessionStartFor = (dateInput) => {
      const date = new Date(dateInput);
      const start = new Date(date.getTime());
      start.setUTCHours(hourUtc, 0, 0, 0);
      return start;
    };

    const getState = (dateInput = new Date()) => {
      const now = new Date(dateInput);
      const start = sessionStartFor(now);
      const end = new Date(start.getTime() + durationMs);

      if (now < start) {
        return {
          state: "upcoming",
          now,
          start,
          end,
          nextStart: start,
          offsetSeconds: 0,
          millisecondsUntilStart: start.getTime() - now.getTime(),
        };
      }

      if (now < end) {
        return {
          state: "live",
          now,
          start,
          end,
          nextStart: start,
          offsetSeconds: (now.getTime() - start.getTime()) / 1000,
          millisecondsUntilStart: 0,
        };
      }

      const nextStart = new Date(start.getTime());
      nextStart.setUTCDate(nextStart.getUTCDate() + 1);

      return {
        state: "ended",
        now,
        start,
        end,
        nextStart,
        offsetSeconds: durationMs / 1000,
        millisecondsUntilStart: nextStart.getTime() - now.getTime(),
      };
    };

    return { getState, sessionStartFor };
  };

  globalThis.QuadcodeLiveSchedule = { create };
})();
