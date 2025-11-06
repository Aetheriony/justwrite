import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Appbar } from "./Appbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faUserPlus,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";

interface Notification {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${BACKEND_URL}/api/v1/user-actions/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched Notifications Response:", res.data);

        // ✅ Handle both cases: array or wrapped object
        const allNotifications = Array.isArray(res.data)
          ? res.data
          : res.data.notifications || [];

        setNotifications(allNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="dark:bg-slate-800 min-h-screen text-center pt-40 text-gray-400 text-lg">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-800 min-h-screen">
      <Appbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1
          className="text-4xl font-bold text-white mb-6"
          style={{ fontFamily: "Anton" }}
        >
          Notifications
        </h1>

        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">
            You have no notifications yet.
          </p>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border dark:border-slate-600 dark:bg-slate-700 ${n.isRead ? "opacity-70" : ""
                  }`}
              >
                <div className="text-white text-lg mt-1">
                  {n.type === "FOLLOW" ? (
                    <FontAwesomeIcon icon={faUserPlus} />
                  ) : n.type === "UNFOLLOW" ? (
                    <FontAwesomeIcon icon={faUserMinus} />
                  ) : (
                    <FontAwesomeIcon icon={faComment} />
                  )}
                </div>

                <div>
                  <p className="text-gray-200">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
