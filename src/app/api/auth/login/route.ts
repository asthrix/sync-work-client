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

    // Return tokens in response body for client-side storage (localStorage)
    // Note: Backend login doesn't return user, user is fetched separately via /auth/me
    return NextResponse.json({
      success: true,
      data: {
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
