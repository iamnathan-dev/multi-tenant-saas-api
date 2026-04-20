import { ApiError } from "@/util/ApiError";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class OAuthService {
  static async verifyGoogleToken(token: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new ApiError("Invalid token payload", 400);
      }

      return {
        googleId: payload.sub!,
        email: payload.email!,
        name: payload.name!,
        avatar: payload.picture!,
      };
    } catch (err) {
      throw new ApiError("Invalid Google token", 400);
    }
  }
}
