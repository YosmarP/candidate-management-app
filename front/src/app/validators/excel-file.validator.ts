import { AbstractControl, ValidationErrors } from '@angular/forms';

export function excelFileValidator(control: AbstractControl): ValidationErrors | null {
  const file = control.value;
  if (!file) return null;
  
  // Validar tanto por tipo MIME como por extensión del archivo
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  const allowedExtensions = ['.xlsx', '.xls'];
  
  const isValid = allowedTypes.includes(file.type) || 
                  allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  return isValid ? null : { invalidFileType: true };
}