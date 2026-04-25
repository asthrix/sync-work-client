import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Support both cookie-based and header-based auth
  const accessToken = request.cookies.get('accessToken')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json() as { success: boolean; data?: any; error?: any };
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
