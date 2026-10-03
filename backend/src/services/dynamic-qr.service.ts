import crypto from 'crypto';

export class DynamicQREngine {
  private readonly STEP_SECONDS = 30;

  /**
   * Generates a secure random 256-bit seed.
   */
  generateSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates the HMAC-SHA256 for a given seed and time step.
   * This is equivalent to what the PWA does.
   */
  generateHMAC(seed: string, timeStep: number): string {
    const hmac = crypto.createHmac('sha256', seed);
    hmac.update(timeStep.toString());
    return hmac.digest('hex');
  }

  /**
   * Validates a provided HMAC hash against the secret seed.
   * Allows a +/- 1 step window to account for network latency.
   */
  validateQR(seed: string, providedHash: string, providedTimeStep: number): boolean {
    const currentUnix = Math.floor(Date.now() / 1000);
    const actualTimeStep = Math.floor(currentUnix / this.STEP_SECONDS);

    // Ensure the provided time step is within the allowable window
    if (Math.abs(actualTimeStep - providedTimeStep) > 1) {
      return false; // Token is expired or from the future
    }

    // Recompute hash for the provided time step
    const expectedHash = this.generateHMAC(seed, providedTimeStep);
    
    // Use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(providedHash, 'hex')
    );
  }
}
