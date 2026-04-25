import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': [
          'refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
          'accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
        ].join(', '),
      },
    }
  );
}
