export interface HealthAssistant {
  id: string;
  name: string;
  photo: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  pricingModel: "fixed" | "hourly" | "bespoke";
  rate?: number;
  rateRange?: { min: number; max: number };
  hospitalId: string;
  verified: boolean;
}

export const HEALTH_ASSISTANTS: HealthAssistant[] = [
  {
    id: "1",
    name: "Ama Mensah",
    photo: "https://i.pravatar.cc/150?img=1",
    specialties: ["General Care", "Maternity", "Patient Escort"],
    rating: 4.8,
    totalReviews: 127,
    pricingModel: "hourly",
    rate: 50,
    hospitalId: "1",
    verified: true,
  },
  {
    id: "2",
    name: "Kwame Osei",
    photo: "https://i.pravatar.cc/150?img=12",
    specialties: ["Emergency Care", "Patient Documentation", "General Care"],
    rating: 4.9,
    totalReviews: 203,
    pricingModel: "fixed",
    rate: 200,
    hospitalId: "1",
    verified: true,
  },
  {
    id: "3",
    name: "Efua Addai",
    photo: "https://i.pravatar.cc/150?img=5",
    specialties: ["Maternity", "Pediatric Care", "Patient Escort"],
    rating: 4.7,
    totalReviews: 89,
    pricingModel: "hourly",
    rate: 45,
    hospitalId: "2",
    verified: true,
  },
  {
    id: "4",
    name: "Kofi Asante",
    photo: "https://i.pravatar.cc/150?img=13",
    specialties: ["General Care", "Elderly Care", "Patient Documentation"],
    rating: 4.6,
    totalReviews: 156,
    pricingModel: "bespoke",
    rateRange: { min: 100, max: 300 },
    hospitalId: "3",
    verified: true,
  },
  {
    id: "5",
    name: "Akosua Boateng",
    photo: "https://i.pravatar.cc/150?img=9",
    specialties: ["Dentistry Support", "Patient Escort", "General Care"],
    rating: 4.9,
    totalReviews: 178,
    pricingModel: "hourly",
    rate: 55,
    hospitalId: "3",
    verified: true,
  },
  {
    id: "6",
    name: "Yaw Mensah",
    photo: "https://i.pravatar.cc/150?img=14",
    specialties: ["Laboratory Support", "Patient Documentation", "General Care"],
    rating: 4.5,
    totalReviews: 94,
    pricingModel: "fixed",
    rate: 150,
    hospitalId: "4",
    verified: true,
  },
];

export const HEALTHCARE_SERVICES = [
  "General Care",
  "Maternity",
  "Pediatric Care",
  "Emergency Care",
  "Elderly Care",
  "Patient Escort",
  "Patient Documentation",
  "Laboratory Support",
  "Dentistry Support",
  "Pharmacy Support",
  "Radiology Support",
  "Queue Management",
  "Card Registration",
  "Vitals Monitoring",
  "Prescription Follow-up",
];

export const HEALTHCARE_ROLES = [
  "Registered Nurse",
  "Registered Health Practitioner",
  "Health Work Student",
  "Health Work Trainee",
  "Active Health Worker",
  "Retired Health Worker",
  "Other",
];
