import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Support both cookie-based and header-based auth
  const accessToken = request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'No token' },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true, token: accessToken });
}
