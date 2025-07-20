import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// 1. Terima 'user' sebagai prop dari App.jsx
function PostList({ user }) {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/posts?page=${currentPage}&limit=6`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error("Error fetching posts:", error))
      .finally(() => setLoading(false));
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPageNumbers = () => {
    // ... (fungsi ini tidak perlu diubah)
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          All Posts
        </h2>
        
        {/* 2. Tombol "Add New Post" hanya muncul jika user sudah login */}
        {user && (
          <Link
            to="/add-post"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-green-500 dark:hover:bg-green-600"
          >
            Add New Post
          </Link>
        )}
      </div>
      
      {loading ? (
        <p className="text-center text-gray-700 dark:text-gray-300">Loading posts...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between transition-transform duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-300"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {post.title}
                  </h3>
                  {/* 3. Tampilkan nama penulis */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    by {post.author?.name || 'Anonymous'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.content.substring(0, 80)}...
                  </p>
                </div>
                <Link
                  to={`/posts/${post._id}`}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline self-start mt-2"
                >
                  Read More →
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              {/* ... (Kontrol paginasi tidak perlu diubah) */}
               <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {renderPageNumbers()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-blue-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PostList;