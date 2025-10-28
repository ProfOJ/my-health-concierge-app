import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/lib/supabase";

export default publicProcedure.query(async () => {
  const [hospitalSessionsResult, homeCareResult, healthSuppliesResult] = await Promise.all([
    supabase
      .from("hospital_sessions")
      .select("*")
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false }),
    supabase
      .from("home_care_requests")
      .select("*")
      .in("status", ["pending", "assigned"])
      .order("created_at", { ascending: false }),
    supabase
      .from("health_supplies_requests")
      .select("*")
      .in("status", ["pending", "processing"])
      .order("created_at", { ascending: false }),
  ]);

  if (hospitalSessionsResult.error) {
    console.error("Error fetching hospital sessions:", hospitalSessionsResult.error);
    throw new Error("Failed to fetch hospital sessions");
  }

  if (homeCareResult.error) {
    console.error("Error fetching home care requests:", homeCareResult.error);
    throw new Error("Failed to fetch home care requests");
  }

  if (healthSuppliesResult.error) {
    console.error("Error fetching health supplies requests:", healthSuppliesResult.error);
    throw new Error("Failed to fetch health supplies requests");
  }

  return {
    hospitalSessions: hospitalSessionsResult.data || [],
    homeCareRequests: homeCareResult.data || [],
    healthSuppliesRequests: healthSuppliesResult.data || [],
  };
});
