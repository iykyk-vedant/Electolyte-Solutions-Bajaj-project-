import { NextRequest, NextResponse } from 'next/server';
import { updatePassword } from '@/lib/auth/auth-service';

// POST /api/auth/update-password - Update user password with recovery token
export async function POST(request: NextRequest) {
  try {
    const { password, accessToken } = await request.json();

    // Validate inputs
    if (!password || !accessToken) {
      return NextResponse.json(
        { error: 'Password and access token are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Update the password
    const result = await updatePassword(password, accessToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password updated successfully',
      success: true,
    }, { status: 200 });
  } catch (error) {
    console.error('Update password API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
