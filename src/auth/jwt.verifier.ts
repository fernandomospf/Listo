import { Injectable } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

@Injectable()
export class JwtVerifier {
  private readonly issuer = process.env.JWT_ISSUER!;
  private readonly audience = process.env.JWT_AUDIENCE ?? 'authenticated';
  private readonly jwks = createRemoteJWKSet(new URL(process.env.SUPABASE_JWKS_URL!));
  private readonly secret =
    process.env.SUPABASE_JWT_SECRET
      ? new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
      : undefined;

  async verify(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
      });
      return payload;
    } catch {
      if (!this.secret) throw new Error('Missing SUPABASE_JWT_SECRET');

      const { payload } = await jwtVerify(token, this.secret, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return payload;
    }
  }
}
