"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { TokenStorage } from "@/services/token-storage";

interface JobResponseData {
  jobId: string;
  status: string;
  workerName?: string;
  workerRating?: number;
  workerDescription?: string;
}

interface JobAcceptedData {
  jobId: string;
  workerName?: string;
  workerRating?: number;
  workerDescription?: string;
}

function buildToastMessage(name: string, rating?: number | null, description?: string | null): string {
  let msg = `${name} accepted your request!`;
  if (rating && rating > 0) {
    msg += ` (${rating}/5 stars)`;
  }
  if (description) {
    msg += ` — ${description}`;
  }
  return msg;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  // Re-check token on every route change (catches login/logout)
  useEffect(() => {
    const current = TokenStorage.getAccessToken();
    setToken(current);
  }, [pathname]);

  useEffect(() => {
    // Only connect for logged-in users with a token
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    // Strip /api to get the base socket URL
    const socketUrl = apiUrl.replace(/\/api\/?$/, "");

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    // Worker accepted via respondToJob
    socket.on("job_response", (data: JobResponseData) => {
      if (data.status === "Accepted") {
        const name = data.workerName || "A worker";
        toast.success(buildToastMessage(name, data.workerRating, data.workerDescription), {
          action: {
            label: "View Job",
            onClick: () => {
              window.location.href = `/client/job/${data.jobId}`;
            },
          },
          duration: 10000,
        });
      }
    });

    // Worker claimed via claimJob
    socket.on("job_accepted", (data: JobAcceptedData) => {
      const name = data.workerName || "A worker";
      toast.success(buildToastMessage(name, data.workerRating, data.workerDescription), {
        action: {
          label: "View Job",
          onClick: () => {
            window.location.href = `/client/job/${data.jobId}`;
          },
        },
        duration: 10000,
      });
    });

    // --- Status updates (client receives these) ---

    const statusMessages: Record<string, string> = {
      OnTheWay: "Your worker is on the way!",
      Arrived: "Your worker has arrived.",
      InProgress: "Work is now in progress. You can confirm when done.",
    };

    socket.on("job_status_update", (data: { jobId: string; status: string }) => {
      const msg = statusMessages[data.status];
      if (msg) {
        toast.info(msg, {
          action: {
            label: "View Job",
            onClick: () => {
              window.location.href = `/client/job/${data.jobId}`;
            },
          },
          duration: 8000,
        });
      }
    });

    socket.on("job_completed", (data: { jobId: string }) => {
      toast.success("Your job has been completed!", {
        action: {
          label: "View Job",
          onClick: () => {
            window.location.href = `/client/job/${data.jobId}`;
          },
        },
        duration: 8000,
      });
    });

    // --- Worker receives these ---

    socket.on("client_confirmed", (data: { jobId: string }) => {
      toast.success("The client confirmed the job is done!", {
        duration: 8000,
      });
    });

    socket.on("job_cancelled", (data: { jobId: string; title?: string }) => {
      toast.warning(`The client cancelled the request${data.title ? `: ${data.title}` : ""}.`, {
        duration: 8000,
      });
    });

    socket.on("new_job_request", (data: { jobId: string; title?: string; category?: string }) => {
      toast.info(`New job request: ${data.title || data.category || "Service request"}`, {
        action: {
          label: "View",
          onClick: () => {
            window.location.href = "/worker/dashboard";
          },
        },
        duration: 10000,
      });
    });

    // --- Chat message notifications ---

    socket.on("message_notification", (data: { jobId: string; message: { senderId?: { email?: string }; content?: string } }) => {
      // Don't show toast if already viewing this chat
      const onChatPage =
        window.location.pathname.includes(`/client/chats/${data.jobId}`) ||
        window.location.pathname.includes(`/worker/chats/${data.jobId}`);
      if (onChatPage) return;

      const senderName = data.message?.senderId?.email?.split("@")[0] || "Someone";
      const preview = data.message?.content?.slice(0, 60) || "New message";
      toast.info(`${senderName}: ${preview}`, {
        action: {
          label: "Open Chat",
          onClick: () => {
            window.location.href = window.location.pathname.includes("/worker")
              ? `/worker/chats/${data.jobId}`
              : `/client/chats/${data.jobId}`;
          },
        },
        duration: 6000,
      });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return <>{children}</>;
}
