import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Login from "./pages/login";
import Register from "./pages/register";
import PasswordReset from "./pages/password-reset";
import TemplateDetail from "./pages/templates/[id]";
import TemplateEditor from "./pages/templates/edit/[id]";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/templates/:id" element={<TemplateDetail />} />
          <Route path="/templates/edit/:id" element={<TemplateEditor />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
