import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthProvider.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Login from "./pages/Login/Login";
import ManualViewer from "./pages/ManualViewer/ManualViewer";
import AdminPanel from "./pages/AdminPanel/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ManualViewer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
