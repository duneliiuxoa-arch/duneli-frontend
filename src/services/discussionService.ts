// =============================================================
// services/discussionService.ts — Real API calls to Duneli backend
// =============================================================
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Auth token helper
async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

// ── Fetch all active discussions ──────────────────────────────
export async function fetchDiscussions(status = 'ACTIVE') {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/discussions?status=${status}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch discussions');
    const data = await res.json();
    return data.topics || [];
  } catch (err) {
    console.error('[discussionService] fetchDiscussions error:', err);
    return [];
  }
}

// ── Create a new topic ────────────────────────────────────────
export async function createTopic(title: string, description?: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/discussions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create topic');
    }
    const data = await res.json();
    return data.topic;
  } catch (err) {
    console.error('[discussionService] createTopic error:', err);
    throw err;
  }
}

// ── Fetch topics created by the logged-in user ───────────────
export async function fetchMyTopics() {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/users/me/topics`, { headers });
    if (!res.ok) throw new Error('Failed to fetch my topics');
    return (await res.json()).topics || [];
  } catch (err) {
    console.error('[discussionService] fetchMyTopics error:', err);
    return [];
  }
}

// ── Fetch topics voted/supported by the logged-in user ───────
export async function fetchSupportedTopics() {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/users/me/votes`, { headers });
    if (!res.ok) throw new Error('Failed to fetch supported topics');
    return (await res.json()).votes || [];
  } catch (err) {
    console.error('[discussionService] fetchSupportedTopics error:', err);
    return [];
  }
}

// ── Fetch meetings attended by the logged-in user ────────────
export async function fetchMyActivity() {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/users/me/activity`, { headers });
    if (!res.ok) throw new Error('Failed to fetch activity');
    return (await res.json()).attendances || [];
  } catch (err) {
    console.error('[discussionService] fetchMyActivity error:', err);
    return [];
  }
}

// ── Join a meeting (records attendee in DB) ───────────────────
export async function joinMeeting(topicId: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/discussions/${topicId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    if (!res.ok) throw new Error('Failed to join meeting');
    return await res.json();
  } catch (err) {
    console.error('[discussionService] joinMeeting error:', err);
  }
}

// ── Leave a meeting (records leftAt in DB) ────────────────────
export async function leaveMeeting(topicId: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/discussions/${topicId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    if (!res.ok) throw new Error('Failed to leave meeting');
    return await res.json();
  } catch (err) {
    console.error('[discussionService] leaveMeeting error:', err);
  }
}

// ── Vote on a topic ───────────────────────────────────────────
export async function voteTopic(topicId: string) {
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_URL}/api/discussions/${topicId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
    });
    if (!res.ok) throw new Error('Failed to vote');
    return await res.json();
  } catch (err) {
    console.error('[discussionService] voteTopic error:', err);
    throw err;
  }
}
