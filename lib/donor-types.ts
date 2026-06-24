export interface EmergencyMatchRequest {
  id: string;
  hospitalName: string;
  location: string;
  bloodType: string;
  requiredPints: number;
  contactPhone: string;
  urgency: "critical" | "high";
  timestamp: string;
  status: "pending" | "matched";
}

export interface DonationRecord {
  id: string;
  date: string;
  hospitalName: string;
  bloodType: string;
  status: "verified";
  pints: number;
}

export type DonorStatus = "available" | "busy" | "inactive";

export interface DonorAlertWithRequest {
  id: string;
  status: string;
  request: {
    bloodGroup: string;
    unitsNeeded: number;
    urgencyLevel: string;
    status: string;
    createdAt: Date;
    hospital: {
      id: string;
      name: string;
      location: string | null;
    };
  };
}
