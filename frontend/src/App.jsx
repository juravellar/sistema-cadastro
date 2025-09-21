import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/components/Login";
import SignUp from "./pages/components/SignUp";
import Home from "./pages/Home";
import HomeAdmin from "./pages/HomeAdmin";
import ErrorPage from "./pages/components/ErrorPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<HomeAdmin />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
