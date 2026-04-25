import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: 'No refresh token' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json() as { success: boolean; data?: any; error?: any };

    if (!data.success) {
      return NextResponse.json(
        { success: false },
        {
          status: 401,
          headers: {
            'Set-Cookie': [
              'refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
              'accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
            ].join(', '),
          },
        }
      );
    }

    const refreshTokenCookie = `refreshToken=${data.data.refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
    const accessTokenCookie = `accessToken=${data.data.access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${15 * 60}`;

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': [refreshTokenCookie, accessTokenCookie].join(', '),
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
