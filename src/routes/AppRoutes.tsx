import {
  Routes,
  Route,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";

import Dashboard from "../pages/Dashboard";
import Pgr from "../pages/Pgr";
import Riscos from "../pages/Riscos";
import Acidentes from "../pages/Acidentes";
import Epis from "../pages/Epis";
import Checklists from "../pages/Checklists";
import DDS from "../pages/DDS";
import Auditorias from "../pages/Auditorias";

export default function AppRoutes() {
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        minHeight: "100vh",

        display: "flex",
        alignItems: "stretch",

        background:
          "#F8FAFC",

        overflowX:
          "hidden",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: "1 1 0",

          minWidth: 0,

          minHeight:
            "100vh",

          position:
            "relative",

          background:
            "#F8FAFC",

          overflowX:
            "hidden",
        }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/pgr"
            element={
              <Pgr />
            }
          />

          <Route
            path="/riscos"
            element={
              <Riscos />
            }
          />

          <Route
            path="/acidentes"
            element={
              <Acidentes />
            }
          />

          <Route
            path="/epis"
            element={
              <Epis />
            }
          />

          <Route
            path="/checklists"
            element={
              <Checklists />
            }
          />

          <Route
            path="/dds"
            element={
              <DDS />
            }
          />

          <Route
            path="/auditorias"
            element={
              <Auditorias />
            }
          />
        </Routes>
      </div>
    </div>
  );
}