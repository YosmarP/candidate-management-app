export interface Candidate {
  id?: number;
  name: string;
  surname: string;
  seniority: 'junior' | 'senior';
  yearsOfExperience: number;
  availability: boolean;
  createdAt?: string;
}