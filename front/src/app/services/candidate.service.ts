import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Candidate } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:3000/candidates';
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  public candidates$ = this.candidatesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCandidates(); // Cargar candidatos al inicializar el servicio
  }

  createCandidate(formData: FormData): Observable<Candidate> {
    return this.http.post<Candidate>(this.apiUrl, formData);
  }

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }
 
  deleteCandidate(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
    tap(() => this.removeCandidateFromLocal(id))
  );
}

  private loadCandidates(): void {
    // Cargar candidatos desde el backend y actualizar el estado local
    this.getCandidates().subscribe({
      next: (candidates) => this.candidatesSubject.next(candidates),
      error: (error) => console.error('Error loading candidates:', error)
    });
  }

  // Métodos para mantener sincronizado el estado local
  addCandidateToLocal(candidate: Candidate): void {
    const currentCandidates = this.candidatesSubject.value;
    this.candidatesSubject.next([candidate, ...currentCandidates]); // Nuevo candidato al inicio
  }

  removeCandidateFromLocal(id: number): void {
    const currentCandidates = this.candidatesSubject.value;
    this.candidatesSubject.next(currentCandidates.filter(c => c.id !== id));
  }
}