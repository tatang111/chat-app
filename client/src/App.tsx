import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { authUser, loading } = useContext(AuthContext)!;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[url('/bgImage.svg')] bg-contain  ">
      </div>
    );
  }
  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain">
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
        />
      </Routes>
    </div>
  );
}

export default App;
