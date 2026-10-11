import AppRoutes from "./routes/AppRoutes";
import AccessibilityWidget from "./components/accessibility/AccessibilityWidget";

function App() {
  return (
    <>
      <AppRoutes />

      <AccessibilityWidget />
    </>
  );
}

export default App;