import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
}

export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  isActive: boolean;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

// API Functions
const fetchUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

const addUser = async (data: UserFormData): Promise<ApiResponse<User>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to add user');
  }
  return response.json();
};

const updateUser = async ({ id, data }: { id: string; data: Partial<UserFormData> }): Promise<ApiResponse<User>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  return response.json();
};

const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  return response;
};

// Custom Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    select: (response) => response,
  });
};

export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
