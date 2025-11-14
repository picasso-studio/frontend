import { useState } from "react";
import { useParams } from "react-router-dom";

// フェーズ型
type Phase = "turnSelect" | "user" | "ai" | "hint" | "end";

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [phase, setPhase] = useState<Phase>("turnSelect");
  const [turn, setTurn] = useState(0);

  return (
    <div>
      <h2>ゲームID: {gameId}</h2>

      {phase === "turnSelect" && (
        <div>
          <p>先手/後手選択</p>
          <button onClick={() => setPhase("user")}>先手を選択</button>
          <button onClick={() => setPhase("ai")}>後手を選択</button>
        </div>
      )}

      {phase === "user" && (
        <div>
          <p>ユーザのターン (ターン {turn})</p>
          <button onClick={() => setPhase("hint")}>ヒント</button>
          <button onClick={() => {
            setTurn(turn + 1);
            setPhase("ai");
          }}>描き終わった</button>
        </div>
      )}

      {phase === "ai" && (
        <div>
          <p>AIのターン (ターン {turn})</p>
          <button onClick={() => setPhase("user")}>AI完了</button>
        </div>
      )}

      {phase === "hint" && (
        <div>
          <p>ヒント表示中</p>
          <button onClick={() => setPhase("user")}>閉じる</button>
        </div>
      )}

      {phase === "end" && (
        <div>
          <p>ゲーム終了</p>
          <button onClick={() => window.location.href = "/"}>ホームに戻る</button>
        </div>
      )}
    </div>
  );
}
