import Subscription from "./pages/Subscription"
import LandingPage from "./pages/LandingPage"
import Register from "./pages/Register"
import Navbar from "./components/Navbar"
import LoginPage from "./pages/LoginPage"
import Documentation from "./pages/Documentation"
import ContactPage from "./pages/ContactPage"
import Footer from "./components/Footer"
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <>
        <Navbar />
        <Routes>
          <Route path="/Home" element={<LandingPage />} />{" "}
          <Route path="/pricing" element={<Subscription />} />{" "}
          <Route path="/register" element={<Register />} />{" "}
          <Route path="/login" element={<LoginPage />} />{" "}
          <Route path="/documentation" element={<Documentation />} />{" "}
          <Route path="/contact" element={<ContactPage />} />{" "}
        </Routes>
        <Footer />
      </>
    </BrowserRouter>
  )
}

export default App
