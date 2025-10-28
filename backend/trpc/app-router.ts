import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { getAllOpenProcedure } from "./routes/requests/get-all-open/route";
import { checkExistingAssistantProcedure } from "./routes/assistants/check-existing/route";
import { getAssistantDataProcedure } from "./routes/assistants/get-assistant-data/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  requests: createTRPCRouter({
    getAllOpen: getAllOpenProcedure,
  }),
  assistants: createTRPCRouter({
    checkExisting: checkExistingAssistantProcedure,
    getAssistantData: getAssistantDataProcedure,
  }),
});

export type AppRouter = typeof appRouter;
