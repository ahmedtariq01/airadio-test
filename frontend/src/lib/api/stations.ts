import { fetchWithAuth } from '@/lib/fetchWithAuth';

export interface Station {
  id: string;
  name: string;
  logo: string;
  is_retail: boolean;
  retail: string;
  is_streaming: boolean;
  stream_url: string;
  location: string;
}

export interface StationFormData {
  name: string;
  logo: File | null;
  is_retail: boolean;
  retail: string;
  is_streaming: boolean;
  stream_url: string;
  location: string;
}

export async function getStations(): Promise<Station[]> {
  const response = await fetchWithAuth('/api/v3/stations/');
  return response.json();
}

export async function createStation(data: StationFormData): Promise<Station> {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.logo) {
    formData.append('logo', data.logo);
  }
  formData.append('is_retail', String(data.is_retail));
  formData.append('retail', data.retail);
  formData.append('is_streaming', String(data.is_streaming));
  formData.append('stream_url', data.stream_url);
  formData.append('location', data.location);

  const response = await fetchWithAuth('/api/v3/stations/', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function updateStation(id: string, data: StationFormData): Promise<Station> {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.logo) {
    formData.append('logo', data.logo);
  }
  formData.append('is_retail', String(data.is_retail));
  formData.append('retail', data.retail);
  formData.append('is_streaming', String(data.is_streaming));
  formData.append('stream_url', data.stream_url);
  formData.append('location', data.location);

  const response = await fetchWithAuth(`/api/v3/stations/${id}/`, {
    method: 'PATCH',
    body: formData,
  });
  return response.json();
}

export async function deleteStation(id: string): Promise<void> {
  await fetchWithAuth(`/api/v3/stations/${id}/`, {
    method: 'DELETE',
  });
} 