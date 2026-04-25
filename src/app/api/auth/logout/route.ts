import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Forward logout to backend if token exists
  const accessToken = request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (accessToken) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      // Ignore backend logout errors
    }
  }

  return NextResponse.json({ success: true });
}
