export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  pesel: string;
  birthDate: string;
  bloodType: string;
  allergies: string;
  diseases: string;
  createdAt?: string;
}

export interface Result {
  id?: number;
  patientId: number;
  date: string;
  glucose?: number;
  systolic?: number;
  diastolic?: number;
  cholesterol?: number;
  weight?: number;
  height?: number;
  notes?: string;
  photoUri?: string;
}

export type RootStackParamList = {
  Home: undefined;
  PatientList: undefined;
  PatientDetail: { patientId: number };
  AddPatient: undefined;
  AddResult: { patientId: number };
};