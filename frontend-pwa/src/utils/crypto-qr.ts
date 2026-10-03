import CryptoJS from 'crypto-js';

const STEP_SECONDS = 30;

export interface QRPayload {
  ticket_id: string;
  time_step: number;
  hmac_hash: string;
}

export function generateDynamicQR(ticketId: string, secretSeed: string): string {
  const currentUnix = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(currentUnix / STEP_SECONDS);
  
  // Calculate HMAC-SHA256
  const hash = CryptoJS.HmacSHA256(timeStep.toString(), secretSeed);
  const hmacHex = CryptoJS.enc.Hex.stringify(hash);
  
  const payload: QRPayload = {
    ticket_id: ticketId,
    time_step: timeStep,
    hmac_hash: hmacHex
  };
  
  return JSON.stringify(payload);
}
