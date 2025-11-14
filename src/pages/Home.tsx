import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const startGame = () => {
    // ダミー gameId
    const gameId = "20251114-000001";
    navigate(`/${gameId}`);
  };

  return (
    <div>
      <h1>ゲーム開始 / 履歴確認</h1>
      <button onClick={startGame}>新規ゲーム開始</button>
      <button onClick={() => navigate("/history")}>履歴を見る</button>
    </div>
  );
}
