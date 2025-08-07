import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fungsi untuk mengambil semua post (tanpa paginasi untuk admin)
    const fetchAllPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/posts?limit=1000"); // Ambil banyak post sekaligus
        if (!response.ok) {
          throw new Error("Failed to fetch posts.");
        }
        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post permanently?")) {
      try {
        const response = await fetch(`http://localhost:3000/posts/${postId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error("Failed to delete post. You may not be the owner or the post doesn't exist.");
        }
        
        // Hapus post dari state agar UI langsung update
        setPosts(posts.filter(p => p.id !== postId));

      } catch (err) {
        alert(err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <p className="text-center p-8">Loading posts...</p>;
  if (error) return <p className="text-center p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Dashboard */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <Link
            to="/add-post"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Post</span>
          </Link>
        </div>

        {/* Tabel Postingan */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Title</th>
                  <th scope="col" className="px-6 py-3">Author</th>
                  <th scope="col" className="px-6 py-3">Created At</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {post.title}
                    </th>
                    <td className="px-6 py-4">
                      {post.author?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/edit-post/${post.id}`)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full"
                        aria-label="Edit Post"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"
                        aria-label="Delete Post"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             {posts.length === 0 && (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No posts found. Create one!
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;