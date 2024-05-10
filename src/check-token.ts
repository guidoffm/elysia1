import { JWTPayload } from "jose";

export function isTokenIssuerValid(tokenData: JWTPayload) {
  if (!process.env.ISSUER) {
    return true;
  }
  const issuerIsValid = tokenData.iss === process.env.ISSUER;
  if (!issuerIsValid) {
    console.error('Invalid issuer');
  }
  return issuerIsValid;
}

/**
 * 
 * @param tokenData 
 * @returns 
 */
export function areTokenTimestampsValid(tokenData: JWTPayload) {
  const now = new Date();
  if (tokenData.nbf) {
    const nbfDate = new Date((tokenData.nbf as number) * 1000);
    if (nbfDate > now) {
      console.error('Token not yet valid');
      return false;
    }
  }
  if (tokenData.exp) {

    const expDate = new Date((tokenData.exp as number) * 1000);

    if (expDate < now) {
      console.error('Token expired');
      return false;
    }
  }

  return true;
}
