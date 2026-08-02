// Safe Stub for Firebase -> Supabase Migration
import { supabase } from './supabase';

export const auth = supabase.auth;
export const db = supabase;
export const functions = null;
export const analytics = null;
export const googleProvider = null;
export const setupRecaptcha = () => null;

export default appStub();

function appStub() {
  return { name: 'duneli-app' };
}
