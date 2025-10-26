import { SessionRequest } from "@/contexts/AppContext";

export const mockSessions: SessionRequest[] = [
  {
    id: "1",
    patientId: "p1",
    patientName: "Kwame Mensah",
    patientGender: "Male",
    patientAgeRange: "45-55",
    specialService: "Cardiology",
    hospitalId: "h1",
    hospitalName: "Korle Bu Teaching Hospital",
    status: "pending",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    requesterName: "Kwame Mensah",
    isRequesterPatient: true,
    estimatedArrival: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    patientId: "p2",
    patientName: "Akosua Boateng",
    patientGender: "Female",
    patientAgeRange: "60-70",
    specialService: "Maternity",
    hospitalId: "h2",
    hospitalName: "Ridge Hospital",
    status: "accepted",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    requesterName: "Yaw Boateng",
    isRequesterPatient: false,
    estimatedArrival: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    patientId: "p3",
    patientName: "Abena Osei",
    patientGender: "Female",
    patientAgeRange: "30-40",
    specialService: "Dentist",
    hospitalId: "h3",
    hospitalName: "37 Military Hospital",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    requesterName: "Abena Osei",
    isRequesterPatient: true,
    estimatedArrival: new Date(Date.now() + 40 * 60 * 1000).toISOString(),
  },
];

export interface SessionDetail extends SessionRequest {
  requesterName: string;
  isRequesterPatient: boolean;
  estimatedArrival: string;
  location?: string;
  hasInsurance?: boolean;
  insuranceProvider?: string;
  hasCard?: boolean;
  notes?: string;
  media?: { id: string; uri: string; type: string }[];
  invoice?: {
    amount: number;
    review?: string;
    paidAt?: string;
  };
}
