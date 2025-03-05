import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CategoryFormData {
  name: string;
  color: string;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

// API Functions
const fetchCategories = async (): Promise<ApiResponse<Category[]>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

const createCategory = async (data: CategoryFormData): Promise<ApiResponse<Category>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create category');
  }
  return response.json();
};

const updateCategory = async ({ id, data }: { id: string; data: CategoryFormData }): Promise<ApiResponse<Category>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update category');
  }
  return response.json();
};

const deleteCategory = async (id: string): Promise<ApiResponse<void>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete category');
  }
  return response.json();
};

// Custom Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    select: (response) => response.data,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
