import { Component } from '@angular/core';
import { CandidateFormComponent } from './components/candidate-form/candidate-form.component';
import { CandidateTableComponent } from './components/candidate-table/candidate-table.component';
import { MatToolbarModule } from '@angular/material/toolbar';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    CandidateFormComponent,
    CandidateTableComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Sistema de Gestión de Candidatos</span>
    </mat-toolbar>

    <div class="container">
      <app-candidate-form></app-candidate-form>
      <app-candidate-table></app-candidate-table>
    </div>
  `
})
export class AppComponent {}
