import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import getAllOpenRequestsRoute from "./routes/requests/get-all-open/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  requests: createTRPCRouter({
    getAllOpen: getAllOpenRequestsRoute,
  }),
});

export type AppRouter = typeof appRouter;
