import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
 
// Her testten sonra cleanup yapılması
afterEach(() => {
  cleanup();
}); 