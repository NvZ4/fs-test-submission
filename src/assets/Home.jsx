import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        Welcome
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        React Post
      </p>
      <Link
        to="/posts"
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
      >
        List Posts
      </Link>
    </div>
  );
}

export default Home;
