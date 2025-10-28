import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/lib/supabase";

export const getAssistantDataProcedure = publicProcedure
  .input(z.object({ assistantId: z.string().uuid() }))
  .query(async ({ input }) => {
    console.log("📊 Fetching assistant data for:", input.assistantId);

    try {
      const [assistantResult, sessionsResult, homeCareResult, liveSessions] = await Promise.all([
        supabase.from("assistants").select("*").eq("id", input.assistantId).single(),
        supabase
          .from("hospital_sessions")
          .select("*")
          .eq("assistant_id", input.assistantId)
          .order("created_at", { ascending: false }),
        supabase
          .from("home_care_requests")
          .select("*")
          .eq("assistant_id", input.assistantId)
          .order("created_at", { ascending: false }),
        supabase
          .from("live_sessions")
          .select("*")
          .eq("assistant_id", input.assistantId)
          .is("ended_at", null)
          .order("started_at", { ascending: false })
          .limit(1),
      ]);

      if (assistantResult.error) {
        console.error("❌ Error fetching assistant:", assistantResult.error);
        throw new Error("Failed to fetch assistant data");
      }

      const assistant = assistantResult.data;

      const hospitalSessions = sessionsResult.data?.map((session: any) => ({
        id: session.id,
        patientId: session.patient_id,
        patientName: session.patient_name,
        patientGender: session.patient_gender,
        patientAgeRange: session.patient_age_range,
        specialService: session.special_service,
        hospitalId: session.hospital_id,
        hospitalName: session.hospital_name,
        assistantId: session.assistant_id,
        status: session.status,
        createdAt: session.created_at,
        acceptedAt: session.accepted_at,
        completedAt: session.completed_at,
        requesterName: session.requester_name,
        isRequesterPatient: session.is_requester_patient,
        estimatedArrival: session.estimated_arrival,
        location: session.location,
        hasInsurance: session.has_insurance,
        insuranceProvider: session.insurance_provider,
        hasCard: session.has_card,
        notes: session.notes,
        invoice: session.invoice_amount
          ? {
              amount: Number(session.invoice_amount),
              review: session.invoice_review,
              paidAt: session.invoice_paid_at,
            }
          : undefined,
      })) || [];

      const homeCareRequests = homeCareResult.data?.map((req: any) => ({
        id: req.id,
        profileId: req.profile_id,
        address: req.address,
        latitude: req.latitude ? Number(req.latitude) : undefined,
        longitude: req.longitude ? Number(req.longitude) : undefined,
        isPatient: req.is_patient,
        patientGender: req.patient_gender,
        patientAge: req.patient_age,
        services: req.services,
        isAtLocation: req.is_at_location,
        contactPerson: req.contact_person,
        patientName: req.patient_name,
        requesterName: req.requester_name,
        requesterContact: req.requester_contact,
        assistantId: req.assistant_id,
        status: req.status,
        createdAt: req.created_at,
        scheduledAt: req.scheduled_at,
        acceptedAt: req.accepted_at,
        completedAt: req.completed_at,
        notes: req.notes,
        invoiceAmount: req.invoice_amount ? Number(req.invoice_amount) : undefined,
        invoicePaidAt: req.invoice_paid_at,
      })) || [];

      const activeLiveSession = liveSessions.data?.[0]
        ? {
            hospitalId: liveSessions.data[0].hospital_id,
            hospitalName: liveSessions.data[0].hospital_name,
            fromDate: liveSessions.data[0].from_date,
            fromTime: liveSessions.data[0].from_time,
            toDate: liveSessions.data[0].to_date,
            toTime: liveSessions.data[0].to_time,
            startedAt: liveSessions.data[0].started_at,
          }
        : null;

      console.log("✅ Assistant data fetched successfully");

      return {
        assistant: {
          id: assistant.id,
          name: assistant.name,
          email: assistant.email,
          phone: assistant.phone,
          address: assistant.address,
          photo: assistant.photo,
          role: assistant.role,
          idPhoto: assistant.id_photo,
          otherDetails: assistant.other_details,
          services: assistant.services,
          pricingModel: assistant.pricing_model,
          rate: assistant.rate ? Number(assistant.rate) : undefined,
          rateMin: assistant.rate_min ? Number(assistant.rate_min) : undefined,
          rateMax: assistant.rate_max ? Number(assistant.rate_max) : undefined,
          verificationStatus: assistant.verification_status,
        },
        hospitalSessions,
        homeCareRequests,
        liveSession: activeLiveSession,
      };
    } catch (error) {
      console.error("❌ Error in getAssistantDataProcedure:", error);
      throw error;
    }
  });
