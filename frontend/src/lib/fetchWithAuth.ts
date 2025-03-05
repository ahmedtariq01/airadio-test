import Cookies from 'js-cookie';
import { redirect } from 'next/navigation';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = Cookies.get('token');
  
  if (!token) {
    // Redirect to login if no token
    redirect('/login');
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    'Authorization': `Bearer ${token}`,
  };

  // If sending FormData, don't set Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies in request
    });

    if (response.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      redirect('/login');
      return;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Network response was not ok');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
} 