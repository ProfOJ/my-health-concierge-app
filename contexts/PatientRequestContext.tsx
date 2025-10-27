import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo } from "react";

interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
}

interface PatientRequestData {
  hospital: Hospital | null;
  assistantId: string | null;
}

export const [PatientRequestProvider, usePatientRequest] = createContextHook(() => {
  const [requestData, setRequestData] = useState<PatientRequestData>({
    hospital: null,
    assistantId: null,
  });

  const setHospital = useCallback((hospital: Hospital) => {
    setRequestData((prev) => ({ ...prev, hospital }));
  }, []);

  const setAssistant = useCallback((assistantId: string | null) => {
    setRequestData((prev) => ({ ...prev, assistantId }));
  }, []);

  const clearRequest = useCallback(() => {
    setRequestData({
      hospital: null,
      assistantId: null,
    });
  }, []);

  return useMemo(
    () => ({
      hospital: requestData.hospital,
      assistantId: requestData.assistantId,
      setHospital,
      setAssistant,
      clearRequest,
    }),
    [requestData.hospital, requestData.assistantId, setHospital, setAssistant, clearRequest]
  );
});
