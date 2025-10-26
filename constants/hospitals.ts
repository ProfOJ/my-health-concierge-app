export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  availableAssistants: number;
}

export const HOSPITALS: Hospital[] = [
  {
    id: "1",
    name: "Korle Bu Teaching Hospital",
    location: "Korle Bu, Accra",
    city: "Accra",
    availableAssistants: 12,
  },
  {
    id: "2",
    name: "37 Military Hospital",
    location: "Burma Camp, Accra",
    city: "Accra",
    availableAssistants: 8,
  },
  {
    id: "3",
    name: "Ridge Hospital",
    location: "Ridge, Accra",
    city: "Accra",
    availableAssistants: 15,
  },
  {
    id: "4",
    name: "Komfo Anokye Teaching Hospital",
    location: "Bantama, Kumasi",
    city: "Kumasi",
    availableAssistants: 10,
  },
  {
    id: "5",
    name: "Tema General Hospital",
    location: "Community 2, Tema",
    city: "Tema",
    availableAssistants: 6,
  },
  {
    id: "6",
    name: "Lekma Hospital",
    location: "Teshie, Accra",
    city: "Accra",
    availableAssistants: 9,
  },
  {
    id: "7",
    name: "Greater Accra Regional Hospital",
    location: "Ridge, Accra",
    city: "Accra",
    availableAssistants: 14,
  },
  {
    id: "8",
    name: "Nyaho Medical Centre",
    location: "Airport Residential Area, Accra",
    city: "Accra",
    availableAssistants: 7,
  },
];
