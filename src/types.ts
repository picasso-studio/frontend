// =================
//       基本形
// =================

export type Actor = 'user' | 'ai';
export type GameStatus = 'created' | 'playing' | 'finished' | 'aborted';
export type GameResult = 'ai-win' | 'user-win' | 'draw' | null;

export interface HistoryEntry {
  actor: Actor;
  word: string | null;
  image: string | null; // 相対パス e.g. "turn-3.png"
}

export interface GameState {
  gameId: string; // YYYYMMDD-HHMMSS
  firstActor: Actor;
  turn: number; // 最新ターン番号
  status: GameStatus;
  result: GameResult; // "ai-win" | "user-win" | "draw" | null
  history: HistoryEntry[];
}

// =================
//        API
// =================

// POST /games
export interface CreateGameRequest {
  firstActor: Actor;
}
export type CreateGameResponse = GameState;

// GET /games (一覧の各要素)
export interface GamesListItem {
  gameId: string;
  result: GameResult;
}

// GET /games/:gameId
export type GetGameStateResponse = GameState;

// PATCH /games/:gameId
export interface PatchGameRequest {
  status?: GameStatus;
  result?: GameResult;
  // 他のフィールドも部分更新可能にする場合は追加
}
export type PatchGameResponse = GameState;

// POST /games/{gameId}/slide
export interface SlideRequest {
  length: number; // mm
}
export interface SlideResponse {
  status: 'accepted' | 'error';
  jobId?: string;
  message?: string;
}

// GET /games/{gameId}/slide/{jobId}
export type SlideJobStatus = 'pending' | 'sliding' | 'done' | 'error';
export interface SlideJobResponse {
  jobId: string;
  status: SlideJobStatus;
}

// POST /games/{gameId}/capture
export type CaptureResponse = GameState;

// POST /games/{gameId}/turn/advance
export type AdvanceTurnResponse = GameState;

// POST /games/{gameId}/ai/analyze
export type AnalyzeResponse = GameState;

// POST /games/{gameId}/ai/next
export type NextResponse = GameState;

// POST /games/{gameId}/ai/plot
export interface PlotRequest {
  word: string;
}
export interface PlotResponse {
  status: 'accepted' | 'error';
  jobId?: string;
  message?: string;
}

// GET /games/{gameId}/ai/plot/{jobId}
export type PlotJobStatus = 'svg_generating' | 'plotting' | 'done' | 'error';
export interface PlotJobResponse {
  jobId: string;
  status: PlotJobStatus;
}

// POST /games/{gameId}/ai/hint
export interface HintRequest {
  word: string;
}
export interface HintResponse {
  hint: string;
}

// POST /games/{gameId}/end
export type EndResponse = GameState;
