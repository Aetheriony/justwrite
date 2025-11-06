import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBookmark,
    faComment,
    faEllipsisH,
    faMinus,
    faPlus,
    faShareAlt,
    faThumbsUp,
    faPencilAlt,
    faUserMinus,
    faUserPlus,
    faVolumeMute,
    faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Blog } from "../hooks";
import { Appbar } from "./Appbar";
import { Right_FullBlog } from "./Right_FullBlog";
import { BACKEND_URL } from "../config";

// ---------------------------
// Full Blog Component
// ---------------------------
export const FullBlog = ({ blog }: { blog: Blog }) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(blog.title);
    const [editedContent, setEditedContent] = useState(blog.content);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // ---------------------------
    // Dropdown Toggle
    // ---------------------------
    const toggleDropdown = () => setDropdownVisible(!isDropdownVisible);

    // ---------------------------
    // Edit Handlers
    // ---------------------------
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You are not logged in.");
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/v1/blog/update/${blog.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: editedTitle,
                    content: editedContent,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Blog updated successfully!");
                setIsEditing(false);
            } else {
                toast.error(data.message || "Failed to update blog.");
            }
        } catch (error) {
            console.error("Error saving blog:", error);
            toast.error("An error occurred while saving the blog.");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedTitle(blog.title);
        setEditedContent(blog.content);
    };

    // ---------------------------
    // Recommendation Handler
    // ---------------------------
    const handleRecommendation = async (
        action: "INCREASE_RECOMMENDATION" | "DECREASE_RECOMMENDATION"
    ) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You are not logged in. Please log in first.");
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/v1/users/recommendations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action, blogId: blog.id }),
            });

            const data = await response.json();

            if (response.ok) toast.success(data.message);
            else toast.error(data.error || "Failed to save recommendation.");
        } catch (error) {
            console.error("Error calling recommendation API:", error);
            toast.error("An error occurred while saving your recommendation.");
        } finally {
            setDropdownVisible(false);
        }
    };

    // ---------------------------
    // Follow & Mute Handlers
    const handleFollow = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You are not logged in.");
                return;
            }
            
            const authorId = blog.author?.id || blog.authorId; // ✅ fallback logic

            if (!authorId) {
                toast.error("Author ID not available.");
                return;
            }

            const endpoint = isFollowing
                ? `${BACKEND_URL}/api/v1/user-actions/unfollow/${authorId}`
                : `${BACKEND_URL}/api/v1/user-actions/follow/${authorId}`;

            const method = isFollowing ? "DELETE" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setIsFollowing(!isFollowing);
            } else {
                toast.error(data.message || "Failed to update follow status.");
            }
        } catch (error) {
            console.error("Error in follow API:", error);
            toast.error("Error following/unfollowing author.");
        } finally {
            setDropdownVisible(false);
        }
    };


    const handleMute = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("You are not logged in.");
                return;
            }

            const authorId = blog.author?.id || blog.authorId; // ✅ fallback logic

            if (!authorId) {
                toast.error("Author ID not available.");
                return;
            }

            const endpoint = isMuted
                ? `${BACKEND_URL}/api/v1/user-actions/unmute/${authorId}`
                : `${BACKEND_URL}/api/v1/user-actions/mute/${authorId}`;

            const method = isMuted ? "DELETE" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setIsMuted(!isMuted);
            } else {
                toast.error(data.message || "Failed to update mute status.");
            }
        } catch (error) {
            console.error("Error in mute API:", error);
            toast.error("Error muting/unmuting author.");
        } finally {
            setDropdownVisible(false);
        }
    };


    // ---------------------------
    // Render
    // ---------------------------
    return (
        <div className="dark:bg-slate-800 min-h-screen">
            <Appbar />
            <ToastContainer position="top-center" autoClose={3000} theme="dark" />
            <div className="flex justify-center">
                <div className="grid grid-cols-12 w-full pt-12 max-w-screen-xl">
                    {/* Left Section */}
                    <div className="col-span-9 pl-5 pr-10">
                        {/* Title Section */}
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="text-5xl font-bold text-white mb-4 bg-slate-700 border border-slate-600 rounded w-full p-2 outline-none"
                                style={{ fontFamily: "Anton" }}
                            />
                        ) : (
                            <h1
                                className="text-5xl font-bold text-white mb-4"
                                style={{ fontFamily: "Anton" }}
                            >
                                {editedTitle}
                            </h1>
                        )}

                        <div className="border-b border-slate-600 my-4" />

                        {/* Interaction Buttons */}
                        {!isEditing && (
                            <>
                                <div className="flex ml-10 justify-between items-center">
                                    {/* Left Section */}
                                    <div className="flex space-x-10">
                                        <IconLabel icon={faThumbsUp} label="Upvote" />
                                        <IconLabel icon={faComment} label="Comment" />
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex mr-10 space-x-10 items-center">
                                        <IconLabel icon={faBookmark} label="Save" />
                                        <IconLabel icon={faShareAlt} label="Share" />

                                        {/* Dropdown Menu */}
                                        <div className="relative">
                                            <div onClick={toggleDropdown} className="cursor-pointer px-2">
                                                <FontAwesomeIcon icon={faEllipsisH} className="text-white text-lg" />
                                            </div>

                                            {isDropdownVisible && (
                                                <DropdownMenu
                                                    onEdit={() => {
                                                        setIsEditing(true);
                                                        setDropdownVisible(false);
                                                    }}
                                                    onMore={() => handleRecommendation("INCREASE_RECOMMENDATION")}
                                                    onLess={() => handleRecommendation("DECREASE_RECOMMENDATION")}
                                                    onFollow={handleFollow}
                                                    onMute={handleMute}
                                                    isFollowing={isFollowing}
                                                    isMuted={isMuted}
                                                />

                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="border-b border-slate-600 my-4" />
                            </>
                        )}

                        {/* Blog Content */}
                        <div className="text-white text-lg leading-relaxed">
                            {isEditing ? (
                                <EditSection
                                    editedContent={editedContent}
                                    setEditedContent={setEditedContent}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            ) : (
                                <div className="prose prose-lg dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{editedContent}</ReactMarkdown>
                                </div>
                            )}
                        </div>

                        <div className="border-b border-slate-600 my-4 shadow-sm" />
                    </div>

                    {/* Right Sidebar */}
                    {!isEditing && <Right_FullBlog blog={blog} />}
                </div>
            </div>
        </div>
    );
};

// ---------------------------
// Reusable Components
// ---------------------------
const IconLabel = ({ icon, label }: { icon: any; label: string }) => (
    <div className="flex items-center text-gray-400 font-extralight text-sm space-x-2">
        <FontAwesomeIcon icon={icon} className="text-gray-600 dark:text-gray-300" />
        <span>{label}</span>
    </div>
);

const DropdownMenu = ({
    onEdit,
    onMore,
    onLess,
    onFollow,
    onMute,
    isFollowing,
    isMuted,
}: {
    onEdit: () => void;
    onMore: () => void;
    onLess: () => void;
    onFollow: () => void;
    onMute: () => void;
    isFollowing: boolean;
    isMuted: boolean;
}) => (
    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
        <MenuItem icon={faPencilAlt} label="Edit Story" onClick={onEdit} />
        <MenuItem icon={faPlus} label="Show More" subtext="Recommend more stories like this" onClick={onMore} />
        <MenuItem icon={faMinus} label="Show Less" subtext="Show fewer stories like this" onClick={onLess} />
        <MenuItem
            icon={isFollowing ? faUserMinus : faUserPlus}
            label={isFollowing ? "Unfollow Author" : "Follow Author"}
            onClick={onFollow}
        />
        <MenuItem
            icon={isMuted ? faVolumeUp : faVolumeMute}
            label={isMuted ? "Unmute Author" : "Mute Author"}
            onClick={onMute}
        />
    </div>
);

const MenuItem = ({
    icon,
    label,
    subtext,
    onClick,
}: {
    icon?: any;
    label: string;
    subtext?: string;
    onClick?: () => void;
}) => (
    <div
        onClick={onClick}
        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
    >
        <div className="flex items-center">
            {icon && <FontAwesomeIcon icon={icon} className="text-gray-600 w-4 h-4 mr-2" />}
            <span>{label}</span>
        </div>
        {subtext && <p className="text-xs text-gray-500 ml-6">{subtext}</p>}
    </div>
);

const EditSection = ({
    editedContent,
    setEditedContent,
    onSave,
    onCancel,
}: {
    editedContent: string;
    setEditedContent: (v: string) => void;
    onSave: () => void;
    onCancel: () => void;
}) => (
    <div>
        <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-screen min-h-[500px] bg-slate-700 border border-slate-600 rounded p-4 text-white outline-none prose prose-lg dark:prose-invert max-w-none"
        />
        <div className="mt-4 flex gap-4">
            <button
                onClick={onSave}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
                Save
            </button>
            <button
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
                Cancel
            </button>
        </div>
    </div>
);

export default FullBlog;
