import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditPost({ user }) {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Cukup ambil data. Biarkan backend yang memeriksa izin.
    fetch(`http://localhost:3000/posts/${postId}`, { credentials: "include" })
      .then((res) => {
        // Jika respons adalah 403 (Forbidden) atau 404, backend menolak akses.)
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("You do not have permission to edit this post.");
          }
          throw new Error("Post not found.");
        }
        return res.json();
      })
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [postId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update post. Please try again.");
      }

      const updatedPost = await response.json();
      navigate(`/posts/${updatedPost.slug}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 dark:text-gray-300">Loading editor...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Title</label>
            <input
              type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Content</label>
            <textarea
              id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="10"
              className="w-full px-3 py-2 border rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div className="flex items-center justify-end space-x-4">
            <button type="button" onClick={() => navigate(-1)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost;