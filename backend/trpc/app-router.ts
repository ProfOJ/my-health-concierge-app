import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { getAllOpenProcedure } from "./routes/requests/get-all-open/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  requests: createTRPCRouter({
    getAllOpen: getAllOpenProcedure,
  }),
});

export type AppRouter = typeof appRouter;
