import { describe, it, expect, vi, beforeEach } from "vitest";

/*
 * Both dependencies are mocked: this test is about *our* wiring (URL built
 * correctly, subscribe happens on connect, messages get parsed and handed
 * off, disconnect actually tears things down) — not about STOMP or SockJS's
 * own internals, which have their own test suites upstream.
 */
let lastSockJsUrl = null;
vi.mock("sockjs-client", () => ({
  default: vi.fn((url) => {
    lastSockJsUrl = url;
    return { url };
  }),
}));

let lastInstance = null;
vi.mock("@stomp/stompjs", () => ({
  Client: vi.fn(function (config) {
    Object.assign(this, config);
    this.activate = vi.fn();
    this.deactivate = vi.fn();
    this.subscribe = vi.fn();
    lastInstance = this;
  }),
}));

const {
  connectNotificationSocket,
  disconnectNotificationSocket,
} = await import("./notificationSocket");

describe("notificationSocket", () => {
  beforeEach(() => {
    lastSockJsUrl = null;
    lastInstance = null;
    disconnectNotificationSocket();
  });

  it("does nothing when there is no token", () => {
    connectNotificationSocket(undefined, vi.fn());
    expect(lastInstance).toBeNull();
  });

  it("builds the SockJS URL under the API's /ws path with the token attached", () => {
    connectNotificationSocket("abc.def.ghi", vi.fn());
    lastInstance.webSocketFactory();
    // Bug this pins: the STOMP endpoint is served by the same
    // DispatcherServlet as every REST call, so it lives under
    // server.servlet.context-path (/api) — NOT at a bare /ws. Regressing
    // this silently breaks real-time notifications again (see
    // notificationSocket.js's comment for the full explanation).
    expect(lastSockJsUrl).toContain("/api/ws?token=");
    expect(lastSockJsUrl).toContain("abc.def.ghi");
  });

  it("activates the client and, once connected, subscribes and forwards parsed notifications", () => {
    const onNotification = vi.fn();
    connectNotificationSocket("tok", onNotification);
    expect(lastInstance.activate).toHaveBeenCalled();

    lastInstance.onConnect();
    expect(lastInstance.subscribe).toHaveBeenCalledWith(
      "/user/queue/notifications",
      expect.any(Function)
    );

    const handler = lastInstance.subscribe.mock.calls[0][1];
    handler({ body: JSON.stringify({ id: 1, title: "ToT renewal pending" }) });
    expect(onNotification).toHaveBeenCalledWith({ id: 1, title: "ToT renewal pending" });

    // A malformed payload must not throw or otherwise take down the socket.
    expect(() => handler({ body: "not json" })).not.toThrow();
  });

  it("disconnect deactivates an active client and is a safe no-op otherwise", () => {
    connectNotificationSocket("tok", vi.fn());
    const instance = lastInstance;
    disconnectNotificationSocket();
    expect(instance.deactivate).toHaveBeenCalled();

    // Calling again with nothing connected must not throw.
    expect(() => disconnectNotificationSocket()).not.toThrow();
  });
});
