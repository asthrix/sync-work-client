import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Support both cookie-based and body-based refresh tokens
  let refreshToken = request.cookies.get('refreshToken')?.value;
  
  if (!refreshToken) {
    try {
      const body = await request.json() as { refresh_token?: string };
      refreshToken = body.refresh_token;
    } catch (e) {
      // No body provided
    }
  }

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
        { success: false, error: data.error },
        { status: 401 }
      );
    }

    // Return new tokens in response body for client-side storage
    return NextResponse.json({
      success: true,
      data: {
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
