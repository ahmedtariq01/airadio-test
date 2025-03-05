import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

// Route segment configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

// Configure size and duration limits
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const maxDuration = 300; // 5 minutes for large file uploads

export async function POST(request) {
  try {
    const formData = await request.formData();
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    console.log('POST Request Details:', {
      url: `${apiUrl}/api/v3/library/`,
      token: token ? 'Present' : 'Missing',
      formData: Object.fromEntries(formData.entries()),
    });

    if (!apiUrl || !token) {
      return NextResponse.json(
        { message: !apiUrl ? 'Server configuration error' : 'Unauthorized - No token found' },
        { status: !apiUrl ? 500 : 401 }
      );
    }

    const url = `http://127.0.0.1:8000/api/v3/library/`;
    console.log('Making request to:', url);

    const response = await axios.post(url, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { message: error.response?.data?.message || error.message || 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Add a GET handler to test the endpoint
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl || !token) {
      return NextResponse.json(
        { message: !apiUrl ? 'Server configuration error' : 'Unauthorized - No token found' },
        { status: !apiUrl ? 500 : 401 }
      );
    }

    const url = `${apiUrl}/api/v3/library/items/`;
    console.log('Testing GET request to:', url);

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { message: error.response?.data?.message || error.message || 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
}
