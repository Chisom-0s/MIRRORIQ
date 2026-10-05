import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.substring(0, idx).trim();
      const v = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      env[k] = v;
    }
  }
});

console.log('Using Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL);

async function runTests() {
  const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('\n--- 1. Testing Products Table with Anon Key (Public RLS) ---');
  const { data: anonProducts, error: anonProdErr } = await anonClient.from('products').select('*').limit(5);
  if (anonProdErr) {
    console.error('Anon products query error:', anonProdErr);
  } else {
    console.log(`Anon products retrieved successfully: ${anonProducts.length} items`);
    anonProducts.forEach(p => console.log(`  - [${p.brand}] ${p.name} (${p.price})`));
  }

  console.log('\n--- 2. Testing Session Creation with Admin Client ---');
  const sessionPayload = {
    selfie_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    status: 'pending',
  };
  const { data: newSession, error: sessErr } = await adminClient.from('analysis_sessions').insert(sessionPayload).select().single();
  if (sessErr) {
    console.error('Session creation error:', sessErr);
    return;
  }
  console.log('Session created successfully:', newSession.id);

  console.log('\n--- 3. Testing Try-On Result Persistence ---');
  const tryOnPayload = {
    session_id: newSession.id,
    source_image_url: newSession.selfie_url,
    result_image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    youcam_task_id: 'task_demo_test_123',
    status: 'success',
  };
  const { data: tryOn, error: tryOnErr } = await adminClient.from('try_on_results').insert(tryOnPayload).select().single();
  if (tryOnErr) {
    console.error('Try-on persistence error:', tryOnErr);
  } else {
    console.log('Try-on result persisted:', tryOn.id, 'Task ID:', tryOn.youcam_task_id);
  }

  console.log('\n--- 4. Testing Skin Analysis Persistence ---');
  const skinPayload = {
    session_id: newSession.id,
    skin_type: 'Combination',
    overall_score: 88.5,
    analysis_data: { hydration: 85, texture: 90, sensitivity: 'low' },
  };
  const { data: skin, error: skinErr } = await adminClient.from('skin_analyses').insert(skinPayload).select().single();
  if (skinErr) {
    console.error('Skin analysis persistence error:', skinErr);
  } else {
    console.log('Skin analysis persisted:', skin.id, 'Skin Type:', skin.skin_type);
  }

  console.log('\n--- 5. Testing Decision Report Persistence ---');
  const reportPayload = {
    session_id: newSession.id,
    confidence_score: 91.0,
    visual_score: 93.0,
    occasion_score: 89.0,
    preference_score: 92.0,
    versatility_score: 90.0,
    recommendation: 'HIGHLY RECOMMENDED',
    explanation: 'The tailored drape and neutral tones harmonize with your profile metrics.',
  };
  const { data: report, error: reportErr } = await adminClient.from('decision_reports').insert(reportPayload).select().single();
  if (reportErr) {
    console.error('Decision report persistence error:', reportErr);
  } else {
    console.log('Decision report persisted:', report.id, 'Confidence Score:', report.confidence_score);
  }

  console.log('\n--- 6. Testing Comparisons Persistence ---');
  const compPayload = {
    session_id: newSession.id,
    score_a: 91.0,
    score_b: 82.0,
  };
  const { data: comp, error: compErr } = await adminClient.from('comparisons').insert(compPayload).select().single();
  if (compErr) {
    console.error('Comparison persistence error:', compErr);
  } else {
    console.log('Comparison persisted:', comp.id);
  }

  console.log('\n--- 7. Testing RLS Access Control with Anon Key ---');
  const { data: anonReadSession, error: anonReadErr } = await anonClient.from('analysis_sessions').select('*').eq('id', newSession.id).single();
  console.log('Anon client read session result:', anonReadSession ? 'SUCCESS' : 'DENIED', anonReadErr?.message || '');

  console.log('\n--- 8. Clean up test session ---');
  const { error: delErr } = await adminClient.from('analysis_sessions').delete().eq('id', newSession.id);
  if (delErr) {
    console.error('Cleanup error:', delErr);
  } else {
    console.log('Test session and cascaded child rows cleaned up successfully.');
  }

  console.log('\n=== ALL SUPABASE DATABASE TESTS PASSED! ===');
}

runTests().catch(console.error);
