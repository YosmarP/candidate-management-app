import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../models/candidate.model';

@Component({
  selector: 'app-candidate-table',
  templateUrl: './candidate-table.component.html',
  styleUrls: ['./candidate-table.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule
  ]
})
export class CandidateTableComponent implements OnInit {
  displayedColumns: string[] = [
    'name', 
    'surname', 
    'seniority', 
    'yearsOfExperience', 
    'availability',
    'actions'
  ];
  
  dataSource: Candidate[] = [];

  constructor(private candidateService: CandidateService) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  private loadCandidates(): void {
    this.candidateService.candidates$.subscribe({
      next: (candidates) => {
        this.dataSource = candidates;
        console.log(this.dataSource)
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
      }
    });
  }

  deleteCandidate(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este candidato?')) {
      this.candidateService.deleteCandidate(id).subscribe({
        next: () => {
          console.log('Candidate deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting candidate:', error);
          alert('Error al eliminar el candidato');
        }
      });
    }
  }

  getAvailabilityText(available: boolean): string {
    return available ? 'Disponible' : 'No disponible';
  }

  getSeniorCount(): number {
    return this.dataSource.filter(candidate => candidate.seniority === 'senior').length;
  }

  getJuniorCount(): number {
    return this.dataSource.filter(candidate => candidate.seniority === 'junior').length;
  }
}