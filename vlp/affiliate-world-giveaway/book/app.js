(() => {
  const API = "https://141-136-42-212.sslip.io/dialogs_monitor/api/affiliate-world";
  const state = {
    sessionToken: sessionStorage.getItem("affiliateWorldSessionToken") || "",
    manageToken: new URLSearchParams(location.search).get("manage") || sessionStorage.getItem("affiliateWorldManageToken") || "",
    slots: [],
    selectedDate: "2026-12-09",
    selectedSlot: "",
    booking: null,
  };

  const elements = Object.fromEntries(
    [
      "globalMessage", "qualificationStep", "scheduleStep", "successStep", "closedStep",
      "qualificationForm", "otherGoalField", "dateTabs", "slotsGrid", "selectedSlotText",
      "confirmBooking", "backToDetails", "successDate", "successLocation", "calendarLink",
      "changeBooking", "cancelBooking",
    ].map((id) => [id, document.getElementById(id)]),
  );

  elements.qualificationForm.meetingGoal.addEventListener("change", (event) => {
    const show = event.target.value === "other";
    elements.otherGoalField.hidden = !show;
    elements.qualificationForm.meetingGoalOther.required = show;
  });
  elements.qualificationForm.addEventListener("submit", verify);
  elements.confirmBooking.addEventListener("click", book);
  elements.backToDetails.addEventListener("click", () => showStep("qualify"));
  elements.changeBooking.addEventListener("click", openReschedule);
  elements.cancelBooking.addEventListener("click", cancelBooking);

  if (state.manageToken) loadManagedBooking();

  async function verify(event) {
    event.preventDefault();
    clearMessage();
    const data = new FormData(elements.qualificationForm);
    const payload = {
      email: data.get("email"),
      qualification: {
        company: data.get("company"),
        geos: data.get("geos"),
        trafficSources: data.get("trafficSources"),
        monthlyFtd: data.get("monthlyFtd"),
        meetingGoal: data.get("meetingGoal"),
        meetingGoalOther: data.get("meetingGoalOther"),
      },
    };
    setLoading(elements.qualificationForm.querySelector("button[type=submit]"), true, "Checking...");
    try {
      const result = await request("/verify", { method: "POST", body: payload });
      if (result.alreadyBooked) {
        state.manageToken = result.manageToken;
        state.booking = result.booking;
        rememberManageToken();
        showConfirmation();
        return;
      }
      state.sessionToken = result.sessionToken;
      state.slots = result.slots;
      sessionStorage.setItem("affiliateWorldSessionToken", state.sessionToken);
      showStep("schedule");
      renderSlots();
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(elements.qualificationForm.querySelector("button[type=submit]"), false, "Check available times");
    }
  }

  async function book() {
    if (!state.selectedSlot) return;
    setLoading(elements.confirmBooking, true, "Confirming...");
    clearMessage();
    try {
      const endpoint = state.booking ? "/manage/reschedule" : "/book";
      const body = state.booking
        ? { token: state.manageToken, slotStart: state.selectedSlot }
        : { sessionToken: state.sessionToken, slotStart: state.selectedSlot };
      const result = await request(endpoint, { method: "POST", body });
      state.booking = result.booking;
      state.manageToken = result.manageToken || state.manageToken;
      state.slots = result.slots || state.slots;
      rememberManageToken();
      showConfirmation();
    } catch (error) {
      if (error.code === "slot_full") {
        await refreshSlots();
        state.selectedSlot = "";
        renderSlots();
      }
      showMessage(error.message);
    } finally {
      setLoading(elements.confirmBooking, false, "Confirm meeting");
    }
  }

  async function loadManagedBooking() {
    clearMessage();
    try {
      const result = await request(`/manage?token=${encodeURIComponent(state.manageToken)}`);
      state.booking = result.booking;
      state.slots = result.slots || [];
      rememberManageToken();
      if (state.booking.status === "cancelled") showStep("closed");
      else showConfirmation();
    } catch (error) {
      showStep("qualify");
      showMessage(error.message);
    }
  }

  async function openReschedule() {
    clearMessage();
    await refreshSlots();
    state.selectedSlot = state.booking.slotStart;
    state.selectedDate = state.booking.slotStart.slice(0, 10);
    showStep("schedule");
    elements.backToDetails.hidden = true;
    renderSlots();
    elements.confirmBooking.textContent = "Save new time";
  }

  async function cancelBooking() {
    if (!window.confirm("Cancel this meeting and release the time slot?")) return;
    setLoading(elements.cancelBooking, true, "Cancelling...");
    try {
      const result = await request("/manage/cancel", {
        method: "POST",
        body: { token: state.manageToken },
      });
      state.booking = result.booking;
      showStep("closed");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(elements.cancelBooking, false, "Cancel booking");
    }
  }

  async function refreshSlots() {
    const endpoint = state.booking
      ? `/manage?token=${encodeURIComponent(state.manageToken)}`
      : `/slots?sessionToken=${encodeURIComponent(state.sessionToken)}`;
    const result = await request(endpoint);
    state.slots = result.slots || [];
  }

  function renderSlots() {
    const dates = [
      ["2026-12-09", "Wednesday, 9 Dec"],
      ["2026-12-10", "Thursday, 10 Dec"],
    ];
    elements.dateTabs.replaceChildren(...dates.map(([date, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "date-tab";
      button.role = "tab";
      button.setAttribute("aria-selected", String(date === state.selectedDate));
      button.textContent = label;
      button.addEventListener("click", () => {
        state.selectedDate = date;
        state.selectedSlot = "";
        renderSlots();
      });
      return button;
    }));

    const daySlots = state.slots.filter((slot) => slot.date === state.selectedDate);
    elements.slotsGrid.replaceChildren(...daySlots.map((slot) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot-button";
      button.disabled = slot.remaining < 1 && slot.start !== state.booking?.slotStart;
      button.classList.toggle("is-selected", slot.start === state.selectedSlot);
      const bangkok = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false,
      }).format(new Date(slot.start));
      const local = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(slot.start));
      button.innerHTML = `<span>${bangkok}</span><small>${local === bangkok ? `${slot.remaining} left` : `${local} local`}</small>`;
      button.setAttribute("aria-label", `${bangkok} Bangkok time, ${slot.remaining} places remaining`);
      button.addEventListener("click", () => {
        state.selectedSlot = slot.start;
        renderSlots();
      });
      return button;
    }));

    const selected = state.slots.find((slot) => slot.start === state.selectedSlot);
    elements.confirmBooking.disabled = !selected;
    elements.selectedSlotText.textContent = selected
      ? `${state.selectedDate === "2026-12-09" ? "9 Dec" : "10 Dec"}, ${formatBangkokTime(selected.start)} Bangkok time`
      : "Choose a time to continue.";
  }

  function showConfirmation() {
    showStep("confirmed");
    elements.successDate.textContent = `${state.booking.bangkokDate} at ${state.booking.bangkokTime}`;
    elements.successLocation.textContent = `${state.booking.location} / Bangkok time`;
    elements.calendarLink.href = `${API}/calendar.ics?token=${encodeURIComponent(state.manageToken)}`;
  }

  function showStep(step) {
    const map = {
      qualify: elements.qualificationStep,
      schedule: elements.scheduleStep,
      confirmed: elements.successStep,
      closed: elements.closedStep,
    };
    for (const panel of Object.values(map)) panel.hidden = true;
    map[step].hidden = false;
    for (const item of document.querySelectorAll("[data-progress]")) {
      const order = ["qualify", "schedule", "confirmed"];
      item.classList.toggle("is-current", item.dataset.progress === step);
      item.classList.toggle("is-complete", order.indexOf(item.dataset.progress) < order.indexOf(step));
    }
    if (step !== "schedule") {
      elements.backToDetails.hidden = false;
      elements.confirmBooking.textContent = "Confirm meeting";
    }
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      method: options.method || "GET",
      headers: options.body ? { "content-type": "application/json", accept: "application/json" } : { accept: "application/json" },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    let body = {};
    try { body = await response.json(); } catch {}
    if (!response.ok) {
      const error = new Error(body.error || "Booking is temporarily unavailable. Please try again.");
      error.code = body.code;
      throw error;
    }
    return body;
  }

  function rememberManageToken() {
    sessionStorage.setItem("affiliateWorldManageToken", state.manageToken);
    const url = new URL(location.href);
    url.searchParams.set("manage", state.manageToken);
    history.replaceState({}, "", url);
  }

  function formatBangkokTime(value) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date(value));
  }

  function showMessage(text, info = false) {
    elements.globalMessage.textContent = text;
    elements.globalMessage.hidden = false;
    elements.globalMessage.classList.toggle("is-info", info);
    elements.globalMessage.focus?.();
  }

  function clearMessage() {
    elements.globalMessage.hidden = true;
    elements.globalMessage.textContent = "";
  }

  function setLoading(button, loading, label) {
    button.disabled = loading;
    button.textContent = label;
    document.body.classList.toggle("is-loading", loading);
  }
})();
