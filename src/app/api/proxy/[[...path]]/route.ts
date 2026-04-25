import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8080/api/v1';

async function proxyRequest(request: NextRequest, method: string) {
  try {
    // Get the path after /api/proxy/
    const pathname = request.nextUrl.pathname;
    const proxyPath = pathname.replace('/api/proxy', '');
    const searchParams = request.nextUrl.search;
    const targetUrl = `${BACKEND_URL}${proxyPath}${searchParams}`;

    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('authorization');

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Prepare request options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for non-GET/HEAD requests
    if (method !== 'GET' && method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    // Forward to backend
    const response = await fetch(targetUrl, fetchOptions);

    // Get response body
    const responseBody = await response.text();

    // Create response with proper status
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });

    return nextResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}
