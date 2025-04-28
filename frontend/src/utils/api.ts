import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const uploadImage = async (formData: FormData) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

interface DetectionParams {
  skip?: number;
  limit?: number;
  min_people?: number;
  max_people?: number;
  min_confidence?: number;
}

export const getDetections = async (params: DetectionParams) => {
  const formattedParams: Record<string, any> = {
    ...params
  };

  // Remove undefined và empty string values
  Object.keys(formattedParams).forEach(key => {
    if (formattedParams[key] === undefined || formattedParams[key] === '') {
      delete formattedParams[key];
    }
  });

  const response = await api.get('/detections', {
    params: formattedParams
  });
  return response.data;
};

export const deleteDetection = async (id: number) => {
  const response = await api.delete(`/detections/${id}`);
  return response.data;
}; 