import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

// ---------------------------------------------
// Type Definitions
// ---------------------------------------------
export interface Blog {
    id: number;
    title: string;
    content: string;
    author: {
        id: number;
        name: string;
        username: string;
    };
}

// ---------------------------------------------
// Hook: Fetch a Single Blog
// ---------------------------------------------
export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog | null>(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // ✅ Proper Bearer header
                    },
                });

                // ✅ Backend now returns the blog object directly
                setBlog(response.data);
            } catch (error) {
                console.error("Error fetching blog:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBlog();
    }, [id]);

    return { loading, blog };
};

// ---------------------------------------------
// Hook: Fetch All Blogs
// ---------------------------------------------
export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // ✅ Expecting response.data.blogs from backend
                setBlogs(response.data.blogs || []);
            } catch (error) {
                console.error("Error fetching blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    return { loading, blogs };
};
