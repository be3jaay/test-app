"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const token = TokenStorage.getAccessToken();

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
      InProgress: "Work is now in progress.",
      WorkDone: "The worker marked the job as done. Please confirm.",
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

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
