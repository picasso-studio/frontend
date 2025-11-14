import { useNavigate } from "react-router-dom";

export default function HistoryList() {
  const navigate = useNavigate();

  // ダミーデータ
  const histories = [
    { gameId: "20251007-192416", result: "draw" },
    { gameId: "20251008-103029", result: "ai-win" },
  ];

  return (
    <div>
      <h1>履歴一覧</h1>
      {histories.map(h => (
        <div key={h.gameId} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
          <p>{h.gameId} ({h.result})</p>
          <button onClick={() => navigate(`/history/${h.gameId}`)}>詳細を見る</button>
        </div>
      ))}
    </div>
  );
}
