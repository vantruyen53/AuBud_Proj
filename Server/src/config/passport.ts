// passport.config.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/aubud/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Trả profile về để controller xử lý
      return done(null, profile);
    }
  )
);

export default passport;