export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  availableAssistants?: number;
}

export const HOSPITALS: Hospital[] = [];
