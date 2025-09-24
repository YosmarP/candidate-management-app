# Instala las dependencias necesarias del proyecto
npm install

# Compila el código TypeScript a JavaScript
npm run build

# Inicia el backend en modo desarrollo con recarga automática
npm run start:dev


# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:cov

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests específicos
npm test -- candidate.service.spec.ts
npm test -- candidates.e2e.spec.ts