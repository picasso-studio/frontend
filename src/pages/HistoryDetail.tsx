import { useParams } from "react-router-dom";

export default function HistoryDetail() {
  const { gameId } = useParams<{ gameId: string }>();

  // ダミーデータ
  const historyEntries = [
    { actor: "user", word: "りんご", image: "turn-1.png" },
    { actor: "ai", word: "ごりら", image: "turn-1.png" },
  ];

  return (
    <div>
      <h1>ゲーム履歴詳細: {gameId}</h1>
      {historyEntries.map((h, idx) => (
        <div key={idx} style={{ border: "1px solid #aaa", margin: "5px", padding: "5px" }}>
          <p>ターン {idx + 1} / {h.actor}</p>
          <p>単語: {h.word}</p>
          <p>画像: {h.image}</p>
        </div>
      ))}
    </div>
  );
}
