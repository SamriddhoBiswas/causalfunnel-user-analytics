(function () {
  "use strict";

  var SESSION_KEY = "session_id";

  function getSessionId() {
    var sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
  }

  var sessionId = getSessionId();

  function sendEvent(eventType, coordinates) {
    var payload = {
      sessionId: sessionId,
      eventType: eventType,
      pageUrl: window.location.href,
      timestamp: new Date().toISOString()
    };

    if (coordinates) {
      payload.x = coordinates.x;
      payload.y = coordinates.y;
    }

    fetch("/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function (error) {
      console.error("Failed to send analytics event:", error);
    });
  }

  sendEvent("page_view");

  document.addEventListener("click", function (event) {
    sendEvent("click", {
      x: event.pageX,
      y: event.pageY
    });
  });
})();
