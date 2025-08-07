import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PostDetail from "./PostDetail";
import PostList from "./PostList";
import AddPost from "./addPost";
import EditPost from "./editPost";
import Login from "./login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ user, children }) => {
  const isAdmin = user && user.email === import.meta.env.VITE_ADMIN_EMAIL;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/posts" replace />;
  }

  return children;
};

function App() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Could not fetch user status", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkUserStatus();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (authLoading) {
    return (
      <div className="text-center p-10 dark:bg-gray-900 dark:text-white min-h-screen">
        Loading Application...
      </div>
    );
  }

  const isAdmin = user && user.email === import.meta.env.VITE_ADMIN_EMAIL;

  return (
    <BrowserRouter>
      {/* --- Navbar --- */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link
              to="/posts"
              className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              Vodea Post Blog
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              {/* Theme Switcher */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={theme === "dark"}
                  onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>

              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Admin Dashboard Link */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  {/* User Welcome */}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Welcome, {user.name}!
                  </span>
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Login Button */}
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  {/* Register Button */}
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* --- Routes --- */}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/posts" />} />
          <Route path="/posts" element={<PostList user={user} />} />
          <Route path="/posts/:slug" element={<PostDetail user={user} />} />
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/add-post"
            element={
              <ProtectedRoute user={user}>
                <AddPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-post/:postId"
            element={
              <ProtectedRoute user={user}>
                <EditPost user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute user={user}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
