// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import type {
  Actor,
  GameState,
  CreateGameRequest,
  PatchGameRequest,
  SlideRequest,
  SlideJobResponse,
  PlotRequest,
  PlotJobResponse,
  HintRequest,
  HintResponse
} from "../types";

// -----------------------------
// メモリ DB
// -----------------------------
const games: Record<string, GameState> = {};
const slideJobs: Record<string, SlideJobResponse> = {};
const plotJobs: Record<string, PlotJobResponse> = {};

// -----------------------------
// ID generator
// -----------------------------
const genGameId = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const genJobId = (gameId: string, type: "slide" | "plot", suffix: string | number) =>
  `job-${gameId}-${type}-${suffix}`;

// -----------------------------
// ハンドラ一覧
// -----------------------------
export const handlers = [
  // POST /games
  http.post<CreateGameRequest, GameState>("/games", async ({ request }) => {
    const { firstActor } = await request.json() as CreateGameRequest;
    const gameId = genGameId();

    const newGame: GameState = {
      gameId,
      firstActor,
      turn: 0,
      status: "created",
      result: null,
      history: [],
    };

    games[gameId] = newGame;

    return HttpResponse.json(newGame, { status: 201 });
  }),

  // GET /games
  http.get<never, { gameId: string; result: string | null }[]>("/games", async () => {
    const list = Object.values(games).map(g => ({ gameId: g.gameId, result: g.result }));
    return HttpResponse.json(list, { status: 200 });
  }),

  // GET /games/:gameId
  http.get<never, GameState>("/games/:gameId", async ({ params }: { params: { gameId: string } }) => {
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(game, { status: 200 });
  }),

  // PATCH /games/:gameId
  http.patch<{ gameId: string }, GameState>("/games/:gameId", async ({ request, params }: { request: Request; params: { gameId: string } }) => {
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const body = await request.json() as PatchGameRequest;

    Object.assign(game, body); // 部分更新
    return HttpResponse.json(game, { status: 200 });
  }),

  // POST /games/:gameId/turn/advance
  http.post<never, GameState>("/games/:gameId/turn/advance", async ({ params }: { params: { gameId: string } }) => {
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    // ターン進行
    game.turn += 1;
    const actor: Actor = game.firstActor === "user"
      ? game.turn % 2 === 1 ? "user" : "ai"
      : game.turn % 2 === 1 ? "ai" : "user";

    game.history.push({ actor, word: null, image: null });
    game.status = "playing";

    return HttpResponse.json(game, { status: 200 });
  }),

  // POST /games/:gameId/capture
  http.post<never, GameState>("/games/:gameId/capture", async ({ params }: { params: { gameId: string } }) => {
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    // 最新ターンの画像を更新
    const turnIndex = game.history.length - 1;
    if (turnIndex >= 0) {
      game.history[turnIndex].image = `turn-${game.turn}.png`;
    }

    return HttpResponse.json(game, { status: 201 });
  }),

  // POST /games/:gameId/ai/analyze
  http.post<never, GameState>("/games/:gameId/ai/analyze", async ({ params }: { params: { gameId: string } }) => {
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    // 最新ターンの word を解析
    const turnIndex = game.history.length - 1;
    if (turnIndex >= 0) {
      game.history[turnIndex].word = "りんご"; // ダミー
      if (game.history[turnIndex].word.endsWith("ん")) {
        game.result = "ai-win";
        game.status = "finished";
      }
    }

    return HttpResponse.json(game, { status: 200 });
  }),

  // POST /games/:gameId/ai/next
  http.post<never, GameState>("/games/:gameId/ai/next", async ({ params }: { params: { gameId: string } }) => {
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    // AI の単語生成
    const turnIndex = game.history.length - 1;
    if (turnIndex >= 0) {
      game.history[turnIndex].word = "ごりら"; // ダミー
      if (game.history[turnIndex].word.endsWith("ん")) {
        game.result = "user-win";
        game.status = "finished";
      }
    }

    return HttpResponse.json(game, { status: 201 });
  }),

  // POST /games/:gameId/ai/hint
  http.post<{ gameId: string }, HintResponse>("/games/:gameId/ai/hint", async ({ request }) => {
    const { word } = await request.json() as unknown as HintRequest;
    return HttpResponse.json({ hint: `ヒント: ${word} に関するヒントです` }, { status: 200 });
  }),

  // POST /games/:gameId/slide
  http.post<{ gameId: string }, SlideJobResponse>("/games/:gameId/slide", async ({ request, params }: { request: Request; params: { gameId: string } }) => {
    const { length } = await request.json() as SlideRequest;
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    const jobId = genJobId(params.gameId, "slide", length);
    const job = { jobId, status: "pending" as const };
    slideJobs[jobId] = job;

    return HttpResponse.json({ status: "accepted", jobId, message: "Sliding started." }, { status: 202 });
  }),

  // GET /games/:gameId/slide/:jobId
  http.get<never, SlideJobResponse>("/games/:gameId/slide/:jobId", async ({ params }: { params: { gameId: string; jobId: string } }) => {
    const job = slideJobs[params.jobId];
    if (!job) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(job, { status: 200 });
  }),

  // POST /games/:gameId/ai/plot
  http.post<{ gameId: string }, PlotJobResponse>("/games/:gameId/ai/plot", async ({ request, params }: { request: Request; params: { gameId: string } }) => {
    await request.json() as PlotRequest; // リクエストボディの検証
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    const jobId = genJobId(params.gameId, "plot", 1);
    const job = { jobId, status: "svg_generating" as const };
    plotJobs[jobId] = job;

    return HttpResponse.json({ status: "accepted", jobId, message: "Plotting started." }, { status: 202 });
  }),

  // GET /games/:gameId/ai/plot/:jobId
  http.get<never, PlotJobResponse>("/games/:gameId/ai/plot/:jobId", async ({ params }: { params: { gameId: string; jobId: string } }) => {
    const job = plotJobs[params.jobId];
    if (!job) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(job, { status: 200 });
  }),

  // POST /games/:gameId/end
  http.post<never, GameState>("/games/:gameId/end", async ({ params }: { params: { gameId: string } }) => {
    const game = games[params.gameId];
    if (!game) return HttpResponse.json({ message: "Not found" }, { status: 404 });

    game.result = "draw";
    game.status = "finished";

    return HttpResponse.json(game, { status: 200 });
  }),
];
