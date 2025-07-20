import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PostDetail from "./PostDetail";
import PostList from "./PostList";
import AddPost from "./addPost";
import EditPost from "./editPost";
import Login from "./login";
import Register from "./Register";

// 1. Buat komponen ProtectedRoute
// Komponen ini akan melindungi rute yang hanya boleh diakses setelah login.
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // Jika tidak ada user, arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }
  return children;
};


function App() {
  const [theme, setTheme] = useState("light");
  // 2. State untuk menyimpan data pengguna yang sedang login
  const [user, setUser] = useState(null);
  // State untuk menandakan proses pengecekan otentikasi sedang berjalan
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme]);

  // 3. useEffect untuk mengecek status login saat aplikasi dimuat
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          credentials: 'include', // Kirim cookie
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // Set data pengguna jika login berhasil
        } else {
          setUser(null); // Set user jadi null jika tidak ada sesi login
        }
      } catch (error) {
        console.error("Could not fetch user status", error);
        setUser(null);
      } finally {
        setAuthLoading(false); // Selesai loading
      }
    };
    checkUserStatus();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData); // Update state user secara global
  };

  if (authLoading) {
    return <div className="text-center p-10 dark:bg-gray-900 dark:text-white min-h-screen">Loading Application...</div>;
  }

  // 4. Fungsi untuk handle logout
  const handleLogout = async () => {
    try {
        await fetch("http://localhost:3000/auth/logout", {
            method: "POST",
            credentials: 'include',
        });
        setUser(null); // Hapus data pengguna dari state
        // Redirect atau biarkan pengguna di halaman yang sama
    } catch (error) {
        console.error("Logout failed", error);
    }
  };
  
  // Tampilkan loading screen selagi mengecek otentikasi
  if (authLoading) {
    return <div className="text-center p-10 dark:bg-gray-900 dark:text-white min-h-screen">Loading Application...</div>;
  }

  return (
    <BrowserRouter>
      {/* --- Navbar --- */}
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <Link to="/posts" className="text-xl font-bold text-blue-700 dark:text-white">
          Random Post App
        </Link>
        <div className="flex items-center space-x-4">
          {/* Theme switcher */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={theme === "dark"} onChange={() => setTheme(theme === "dark" ? "light" : "dark")}/>
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600"></div>
          </label>
          {/* 5. Tampilan kondisional berdasarkan status login */}
          {user ? (
            // Jika user login
            <>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Welcome, {user.name}!
              </span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm">
                Logout
              </button>
            </>
          ) : (
            // Jika user belum login
            <>
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
                Login
              </Link>
              <Link to="/register" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* --- Routes --- */}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/posts" />} />
          {/* 6. Kirim 'user' sebagai prop ke komponen yang membutuhkan */}
          <Route path="/posts" element={<PostList user={user} />} />
          <Route path="/posts/:id" element={<PostDetail user={user} />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />

          {/* 7. Gunakan ProtectedRoute untuk rute privat */}
          <Route path="/add-post" element={
            <ProtectedRoute user={user}>
              <AddPost />
            </ProtectedRoute>
          } />
          <Route path="/edit-post/:id" element={
            <ProtectedRoute user={user}>
              <EditPost user={user} />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;