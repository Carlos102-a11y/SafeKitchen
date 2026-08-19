import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/auth/ProtectedRoute";

import Dashboard from "../pages/Dashboard";
import Pgr from "../pages/Pgr";
import Riscos from "../pages/Riscos";
import Acidentes from "../pages/Acidentes";
import Epis from "../pages/Epis";
import Checklists from "../pages/Checklists";
import DDS from "../pages/DDS";
import Auditorias from "../pages/Auditorias";

import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/cadastro"
        element={<Cadastro />}
      />

      {/* Rotas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<SistemaLayout />}>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/pgr"
            element={<Pgr />}
          />

          <Route
            path="/riscos"
            element={<Riscos />}
          />

          <Route
            path="/acidentes"
            element={<Acidentes />}
          />

          <Route
            path="/epis"
            element={<Epis />}
          />

          <Route
            path="/checklists"
            element={<Checklists />}
          />

          <Route
            path="/dds"
            element={<DDS />}
          />

          <Route
            path="/auditorias"
            element={<Auditorias />}
          />
        </Route>
      </Route>

      {/* Rota inexistente */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

function SistemaLayout() {
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        minHeight: "100vh",

        display: "flex",
        alignItems: "stretch",

        background: "#F8FAFC",

        overflowX: "hidden",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: "1 1 0",

          minWidth: 0,
          minHeight: "100vh",

          position: "relative",

          background: "#F8FAFC",

          overflowX: "hidden",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}