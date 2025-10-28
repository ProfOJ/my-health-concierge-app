import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getSupabase } from "@/lib/supabase";

export const checkExistingAssistantProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    console.log("🔍 Checking for existing assistant:", input);

    if (!input.email && !input.phone) {
      return { exists: false, assistant: null };
    }

    try {
      const supabase = await getSupabase();
      let query = supabase.from("assistants").select("*");

      if (input.email && input.phone) {
        query = query.or(`email.eq.${input.email},phone.eq.${input.phone}`);
      } else if (input.email) {
        query = query.eq("email", input.email);
      } else if (input.phone) {
        query = query.eq("phone", input.phone);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("❌ Error checking for assistant:", error);
        throw new Error("Failed to check for existing assistant");
      }

      if (data) {
        console.log("✅ Found existing assistant:", data.id);
        return {
          exists: true,
          assistant: {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            photo: data.photo,
            role: data.role,
            idPhoto: data.id_photo,
            otherDetails: data.other_details,
            services: data.services,
            pricingModel: data.pricing_model,
            rate: data.rate ? Number(data.rate) : undefined,
            rateMin: data.rate_min ? Number(data.rate_min) : undefined,
            rateMax: data.rate_max ? Number(data.rate_max) : undefined,
            verificationStatus: data.verification_status,
          },
        };
      }

      console.log("ℹ️ No existing assistant found");
      return { exists: false, assistant: null };
    } catch (error) {
      console.error("❌ Error in checkExistingAssistantProcedure:", error);
      throw error;
    }
  });
