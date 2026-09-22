import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import EventPage from "./pages/EventPage.jsx";
import TicketPage from "./pages/TicketPage.jsx";
import DetailsPage from "./pages/DetailsPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import FailurePage from "./pages/FailurePage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<EventPage />} />
        <Route path="/tickets" element={<TicketPage />} />
        <Route path="/details" element={<DetailsPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/failure" element={<FailurePage />} />
        <Route path="*" element={<EventPage />} />
      </Routes>
    </>
  );
}
