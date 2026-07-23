/**
 * Ambient module declaration for react-native-dotenv's virtual `@env` module.
 * The babel plugin (see babel.config.js) rewrites `@env` imports to the
 * actual values from `.env` at build time — this just tells TypeScript what
 * shape to expect so imports type-check.
 */
declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}
