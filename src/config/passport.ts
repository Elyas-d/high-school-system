import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GoogleProfile } from '../types/auth.types';

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
      callbackURL: process.env['GOOGLE_CALLBACK_URL'] || 'http://localhost:3001/auth/google/callback',
      passReqToCallback: true,
    },
    async (_req: any, _accessToken: string, _refreshToken: string, _params: any, profile: any, done: any) => {
      try {
        // Pass the profile to the callback
        return done(null, profile);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user for session (not used in JWT, but required by passport)
passport.serializeUser((user: any, done: any) => {
  done(null, user);
});

// Deserialize user from session (not used in JWT, but required by passport)
passport.deserializeUser((user: any, done: any) => {
  done(null, user);
});

export default passport; 