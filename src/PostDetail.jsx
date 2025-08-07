import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PostDetail({ user }) {
  const { slug } = useParams();
  console.log("PostDetail received slug from URL:", slug);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/posts/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data) => {
        setPost(data);
        fetchComments(data.id, 1);
      })
      .catch((err) => {
        console.error("Error fetching post details:", err);
        setError(err.message);
      });
  }, [slug]);

  const fetchComments = (postId, page) => {
    const limit = 5;
    fetch(
      `http://localhost:3000/posts/${postId}/comments?page=${page}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        setComments((prev) =>
          page === 1 ? data.comments : [...prev, ...data.comments]
        );
        setCommentPage(data.currentPage);
        setHasMoreComments(data.currentPage < data.totalPages);
      })
      .catch((error) => console.error("Error fetching comments:", error))
      .finally(() => setLoadingMore(false));
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      fetch(`http://localhost:3000/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            navigate("/posts");
          } else {
            alert("Failed to delete post. You may not be the owner.");
          }
        })
        .catch((error) => console.error("Error deleting post:", error));
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:3000/posts/${post.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newComment }),
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to add comment.");
      const addedComment = await response.json();
      setComments((prevComments) => [addedComment, ...prevComments]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleLoadMoreComments = () => {
    const nextPage = commentPage + 1;
    setLoadingMore(true);
    fetchComments(post.id, nextPage);
  };

  if (error)
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!post)
    return (
      <p className="text-center mt-10 dark:text-gray-300">Loading post...</p>
    );

  const isOwner = user && user.id === post.author?.id;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-grow">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {post.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                <span>by {post.author?.name || "Anonymous"}</span>
                <span className="mx-2">•</span>
                <span>Published on {formatDate(post.published_at)}</span>
              </div>
            </div>
            {isOwner && (
              <div className="flex space-x-2 flex-shrink-0 ml-4">
                <Link
                  to={`/edit-post/${post.id}`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap text-lg">
            {post.content}
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Comments
          </h3>
          {user ? (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Comment"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You must be{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                logged in
              </Link>{" "}
              to post a comment.
            </p>
          )}

          <ul className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <li
                  key={comment.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                >
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {comment.author?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(comment.createdAt, true)}
                    </p>
                  <p className="text-gray-800 dark:text-gray-200 mt-1">
                    {comment.content}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet.
              </p>
            )}
          </ul>

          {hasMoreComments && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMoreComments}
                disabled={loadingMore}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
