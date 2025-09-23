// setup-jest.ts
import 'jest-preset-angular/setup-jest';

Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});