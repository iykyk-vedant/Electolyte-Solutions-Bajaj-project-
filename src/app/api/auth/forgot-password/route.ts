import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordForEmail } from '@/lib/auth/auth-service';

// POST /api/auth/forgot-password - Send password reset email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Basic validation
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Send reset email via Supabase
    const result = await resetPasswordForEmail(email);

    if (result.error) {
      // Still return success to prevent email enumeration
      console.error('Password reset error:', result.error);
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
      success: true,
    }, { status: 200 });
  }
}
