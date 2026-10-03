import { DynamicQREngine } from '../src/services/dynamic-qr.service';
import crypto from 'crypto';

describe('DynamicQREngine', () => {
  const qrEngine = new DynamicQREngine();
  let seed: string;

  beforeAll(() => {
    seed = qrEngine.generateSeed();
  });

  test('should validate a correct HMAC generated at the current time step', () => {
    const currentUnix = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(currentUnix / 30);
    
    const hash = qrEngine.generateHMAC(seed, timeStep);
    
    const isValid = qrEngine.validateQR(seed, hash, timeStep);
    expect(isValid).toBe(true);
  });

  test('should reject an HMAC with a tampered time step', () => {
    const currentUnix = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(currentUnix / 30);
    
    const hash = qrEngine.generateHMAC(seed, timeStep);
    
    // Attacker tries to use the valid hash for a future/past timestep
    const isValid = qrEngine.validateQR(seed, hash, timeStep + 1);
    expect(isValid).toBe(false);
  });

  test('should reject an HMAC from a time step too far in the past (drift > 1)', () => {
    const currentUnix = Math.floor(Date.now() / 1000);
    const actualTimeStep = Math.floor(currentUnix / 30);
    const oldTimeStep = actualTimeStep - 2; // Too old
    
    const hash = qrEngine.generateHMAC(seed, oldTimeStep);
    
    const isValid = qrEngine.validateQR(seed, hash, oldTimeStep);
    expect(isValid).toBe(false);
  });
});
