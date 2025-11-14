import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ページコンポーネント
import Home from "./pages/Home";
import Game from "./pages/Game";
import HistoryList from "./pages/HistoryList";
import HistoryDetail from "./pages/HistoryDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:gameId" element={<Game />} />
        <Route path="/history" element={<HistoryList />} />
        <Route path="/history/:gameId" element={<HistoryDetail />} />
      </Routes>
    </Router>
  );
}
