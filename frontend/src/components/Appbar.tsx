import { Avatar } from "./BlogCard";
import { Link, useNavigate } from "react-router-dom";
import { notifySuccess } from "./Notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import logo from "../assets/logo.jpg";

export const Appbar = () => {
    const navigate = useNavigate();
    const [hasUnread, setHasUnread] = useState(false);


    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
        notifySuccess("Logout Successful");
    };

  
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await axios.get(`${BACKEND_URL}/api/v1/user-actions/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const notifications = res.data?.notifications || [];
                const hasUnreadNotifs = notifications.some((n: any) => !n.isRead);
                setHasUnread(hasUnreadNotifs);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };

        fetchUnread();
    }, []);

    return (
        <div className="border-b flex dark:bg-slate-800 justify-between px-10 py-4 sticky top-0 z-50 shadow-md">
            {/* Logo */}
            <Link
                to="/blogs"
                className="flex items-center cursor-pointer space-x-2"
            >
                <img
                    src={logo}
                    alt="JustWrite Logo"
                    className="h-10 w-10 rounded-full object-cover"
                />

                <span
                    className="text-3xl dark:text-white font-bold tracking-wide"
                    style={{ fontFamily: "Anton" }}
                >
                    JustWrite
                </span>
            </Link>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search blogs..."
                    className="block w-72 px-4 py-2 text-gray-900 dark:text-gray-100 border rounded-full focus:outline-none shadow-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />

                {/* Write Button */}
                <Link to="/publish">
                    <button className="px-5 py-2 text-white bg-green-600 hover:bg-green-700 rounded-full font-medium shadow-sm transition">
                        Write
                    </button>
                </Link>

                {/* Notification Button */}
                <button
                    onClick={() => navigate("/notifications")}
                    className="relative p-2 rounded-full hover:bg-slate-700 transition"
                    title="Notifications"
                >
                    <FontAwesomeIcon icon={faBell} className="text-white text-xl" />
                    {hasUnread && (
                        <span className="absolute top-1 right-1 bg-red-500 h-2 w-2 rounded-full"></span>
                    )}
                </button>

                {/* Avatar */}
                <Avatar size="big" name="Himanshu" onLogout={handleLogout} />
            </div>
        </div>
    );
};
