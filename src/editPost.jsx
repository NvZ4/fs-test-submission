import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// 1. Terima 'user' sebagai prop untuk mengetahui siapa yang sedang login
function EditPost({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 2. Tambahkan 'credentials: include' untuk mengirim cookie
    // Ini diperlukan jika rute GET post di masa depan diproteksi
    fetch(`http://localhost:3000/posts/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => {
        // 3. Lakukan pengecekan otorisasi
        // Cek apakah pengguna yang login adalah pemilik post
        if (user && data.author && user._id === data.author._id) {
          setTitle(data.title);
          setContent(data.content);
        } else {
          // Jika bukan pemilik, set error dan jangan tampilkan form
          throw new Error("You do not have permission to edit this post.");
        }
      })
      .catch((err) => {
        console.error("Error fetching post:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
    // Tambahkan 'user' sebagai dependency untuk re-render jika user berubah
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 4. Tambahkan 'credentials: include' untuk mengirim cookie otentikasi
      const response = await fetch(`http://localhost:3000/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
        credentials: 'include', // <-- Penting untuk otorisasi
      });

      if (!response.ok) {
        throw new Error("Failed to update post. Please try again.");
      }
      
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error("Error submitting post:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 dark:text-gray-300">Loading form...</p>;
  }
  
  // Jika ada error (misal, bukan pemilik), tampilkan pesan error
  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }

  // Form hanya akan dirender jika tidak ada error otorisasi
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Post
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-gray-700 dark:text-gray-300 font-semibold mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="6"
              className="w-full px-3 py-2 border rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Post"}
            </button>
             <button
              type="button"
              onClick={() => navigate(`/posts/${id}`)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPost;