"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  useUsers,
  useAddUser,
  useUpdateUser,
  useDeleteUser,
  User,
  UserFormData,
} from "@/lib/hooks/user";

export default function UsersSection() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    is_active: true,
  });

  // Queries and Mutations
  const { data: users = [], isLoading, error } = useUsers();
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      is_active: true,
    });
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    addUserMutation.mutate(formData, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        resetForm();
      },
    });
  };

  const handleEditUser = () => {
    if (selectedUser) {
      const { password, ...updateData } = formData;
      updateUserMutation.mutate(
        {
          id: selectedUser.id,
          data: updateData,
        },
        {
          onSuccess: () => {
            setIsEditModalOpen(false);
            resetForm();
          },
        }
      );
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          resetForm();
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ac5be]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <p>
            Error loading users:{" "}
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Users
        </h2>
        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-lg
            inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setFormData({
                            username: user.username,
                            email: user.email,
                            is_active: user.is_active,
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Add New User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                focus:outline-none focus:ring-1 focus:ring-[#7ac5be]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                focus:outline-none focus:ring-1 focus:ring-[#7ac5be]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                focus:outline-none focus:ring-1 focus:ring-[#7ac5be]"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-[#7ac5be] focus:ring-[#7ac5be]"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Active
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
            disabled={addUserMutation.isPending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 
              dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-[#7ac5be] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddUser}
            disabled={addUserMutation.isPending}
            className="px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-md 
              text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-[#7ac5be] disabled:opacity-50 flex items-center gap-2"
          >
            {addUserMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adding...
              </>
            ) : (
              "Add User"
            )}
          </button>
        </div>
        {addUserMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded">
            Error adding user:{" "}
            {addUserMutation.error instanceof Error
              ? addUserMutation.error.message
              : "Unknown error occurred"}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Edit User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                focus:outline-none focus:ring-1 focus:ring-[#7ac5be]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                focus:outline-none focus:ring-1 focus:ring-[#7ac5be]"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-[#7ac5be] focus:ring-[#7ac5be]"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Active
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setIsEditModalOpen(false);
              resetForm();
            }}
            disabled={updateUserMutation.isPending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 
              dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-[#7ac5be] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEditUser}
            disabled={updateUserMutation.isPending}
            className="px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-md 
              text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-[#7ac5be] disabled:opacity-50 flex items-center gap-2"
          >
            {updateUserMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
        {updateUserMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded">
            Error updating user:{" "}
            {updateUserMutation.error instanceof Error
              ? updateUserMutation.error.message
              : "Unknown error occurred"}
          </div>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          resetForm();
        }}
        title="Delete User"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this user? This action cannot be
            undone.
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setIsDeleteModalOpen(false);
              resetForm();
            }}
            disabled={deleteUserMutation.isPending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 
              dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-[#7ac5be] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteUser}
            disabled={deleteUserMutation.isPending}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md 
              text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
          >
            {deleteUserMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
        {deleteUserMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded">
            Error deleting user:{" "}
            {deleteUserMutation.error instanceof Error
              ? deleteUserMutation.error.message
              : "Unknown error occurred"}
          </div>
        )}
      </Modal>
    </div>
  );
}
