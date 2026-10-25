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
import Suporte from "../pages/Suporte";
import Perfil from "../pages/Perfil";
import Funcionarios from "../pages/Funcionarios";
import Afastamentos from "../pages/Afastamentos";
import Ltcat from "../pages/Ltcat";
import Ppp from "../pages/Ppp";

import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ROTAS PÚBLICAS */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/cadastro"
        element={<Cadastro />}
      />

      {/* ROTAS PROTEGIDAS */}

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
            path="/funcionarios"
            element={<Funcionarios />}
          />

         <Route
            path="/afastamentos"
            element={<Afastamentos />}
          />

         <Route
            path="/ltcat"
            element={<Ltcat />}
          />

         <Route
            path="/ppp"
            element={<Ppp />}
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

          <Route
            path="/suporte"
            element={<Suporte />}
          />

          <Route
            path="/perfil"
            element={<Perfil />}
          />
        </Route>
      </Route>

      {/* ROTA INEXISTENTE */}

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

      <div
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
      </div>
    </div>
  );
}