import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json() as { success: boolean; data?: any; error?: any };

    if (!data.success) {
      return NextResponse.json(data, { status: 401 });
    }

    const refreshTokenCookie = `refreshToken=${data.data.refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
    const accessTokenCookie = `accessToken=${data.data.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${15 * 60}`;

    return NextResponse.json(
      { success: true, data: { user: data.data.user } },
      {
        headers: {
          'Set-Cookie': [refreshTokenCookie, accessTokenCookie].join(', '),
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
