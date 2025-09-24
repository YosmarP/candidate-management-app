import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CandidateService } from '../../services/candidate.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Importaciones de Validators
import { excelFileValidator } from 'src/app/validators/excel-file.validator';

// Importaciones de Directivas
import { AutoFocusDirective } from 'src/app/directives/auto-focus.directive';

@Component({
  selector: 'app-candidate-form',
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    AutoFocusDirective 
  ]
})
export class CandidateFormComponent {
  candidateForm: FormGroup;
  selectedFile: File | null = null;
  focusedField: string | null = null;
  focusTrigger: number = 0;

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private snackBar: MatSnackBar
  ) {
    this.candidateForm = this.createForm();    
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      excelFile: [null, [Validators.required, excelFileValidator]]
    });
  }

  onFieldFocus(fieldName: string): void {
    this.focusedField = fieldName;
  }

  // Control de foco para mejorar la experiencia de usuario
  onFieldBlur(fieldName: string): void {
    if (this.focusedField === fieldName) {
      this.focusedField = null;
    }
    // Mostrar errores solo cuando el campo ha sido interactuado y no tiene foco
    this.candidateForm.get(fieldName)?.markAsTouched();
  }

  shouldShowError(fieldName: string): boolean {
    const field = this.candidateForm.get(fieldName);
    // Mostrar error solo si el campo está touched y no está enfocado
    return field ? field.invalid && field.touched && this.focusedField !== fieldName : false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file;
    
    this.candidateForm.patchValue({ excelFile: file });
    this.candidateForm.get('excelFile')?.markAsTouched();
    this.candidateForm.get('excelFile')?.updateValueAndValidity();
  }  

  onSubmit(): void {
    if (this.candidateForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('name', this.candidateForm.get('name')?.value);
      formData.append('surname', this.candidateForm.get('surname')?.value);
      formData.append('excelFile', this.selectedFile);

      this.candidateService.createCandidate(formData).subscribe({
        next: (candidate) => {
          this.candidateService.addCandidateToLocal(candidate);
          this.onClear();
          this.showSnackBar('Candidato agregado exitosamente!', 'success');
          
          this.triggerFocus();
        },
        error: (error) => {
          console.error('Error adding candidate:', error);
          this.showSnackBar('Error al agregar candidato: ' + error.message, 'error');
        }
      });
    } else {
      // Forzar validación de todos los campos si el formulario es inválido
      this.markFormGroupTouched();
      this.showSnackBar('Por favor complete todos los campos requeridos', 'warning');
    }
  }

  onClear(): void {
    this.candidateForm.reset();
    this.selectedFile = null;
    this.focusedField = null;
    
    // Resetear también el input de archivo HTML
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    this.triggerFocus();
  }

  private markFormGroupTouched(): void {
    // Marcar todos los campos como "touched" para forzar la validación
    Object.keys(this.candidateForm.controls).forEach(key => {
      this.candidateForm.get(key)?.markAsTouched();
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    // Sistema de notificaciones con estilos diferenciados por tipo
    const panelClass = {
      'success': 'snackbar-success',
      'error': 'snackbar-error',
      'warning': 'snackbar-warning',
      'info': 'snackbar-info'
    }[type];

    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: [panelClass],
      verticalPosition: 'top'
    });
  }

  private triggerFocus(): void {
    this.focusTrigger = Date.now(); // Cambiar el valor para trigger
  }
}