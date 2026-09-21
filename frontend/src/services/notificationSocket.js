import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/*
 * Bug fix: the app previously had zero WebSocket client code even though the
 * backend has always pushed new notifications over STOMP
 * (SimpMessagingTemplate.convertAndSendToUser in NotificationService). With
 * no one subscribing, every "instant" push notification silently went
 * nowhere, and the bell only ever updated on the 60-second poll
 * (useNotifications / AppRoutes' AppBootstrap). This client closes that gap.
 *
 * The endpoint lives at `${BASE_URL}/ws` — i.e. still under
 * server.servlet.context-path (/api), the same as every REST call. STOMP
 * endpoints registered via registerStompEndpoints() are served by the same
 * DispatcherServlet as the rest of the app, so they inherit the context
 * path exactly like the REST controllers and the /uploads/** resource
 * handler do — there is no separate, unprefixed /ws. (See nginx.conf's
 * `/api/ws/` block for the matching production-proxy side of this.)
 */
const WS_URL = `${BASE_URL.replace(/\/$/, "")}/ws`;

let client = null;

/**
 * Opens a STOMP-over-SockJS connection authenticated with the given JWT and
 * subscribes to the current user's private notification queue.
 *
 * @param {string} token - the JWT (same one already used for REST calls);
 *   sent as a `?token=` query param because neither a native WebSocket nor
 *   SockJS's fallbacks let client code attach a custom Authorization header.
 * @param {(notification: object) => void} onNotification - called with the
 *   parsed NotificationDTO.Response every time one arrives.
 */
export function connectNotificationSocket(token, onNotification) {
  if (!token) return;
  disconnectNotificationSocket();

  client = new Client({
    webSocketFactory: () => new SockJS(`${WS_URL}?token=${encodeURIComponent(token)}`),
    reconnectDelay: 5000,
    // Quiet by default — connection hiccups (a laptop sleeping, a flaky
    // network) are routine and shouldn't spam the browser console; the
    // 60-second poll (see AppRoutes) is still there as a safety net for any
    // notification missed while reconnecting.
    onStompError: () => {},
    onWebSocketError: () => {},
  });

  client.onConnect = () => {
    client.subscribe("/user/queue/notifications", (message) => {
      try {
        onNotification(JSON.parse(message.body));
      } catch (_) {
        // Malformed payload — ignore rather than crash the socket handler;
        // the notification will still show up on the next poll.
      }
    });
  };

  client.activate();
}

export function disconnectNotificationSocket() {
  if (client) {
    client.deactivate();
    client = null;
  }
}
