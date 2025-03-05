'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category,
  CategoryFormData,
} from '@/lib/api/categories';

export default function CategoriesSection() {
  // React Query hooks
  const { data: categories = [], isLoading, isError } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Local state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<CategoryFormData>({
    name: '',
    color: '#7ac5be',
  });

  // Handlers
  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      try {
        await createCategoryMutation.mutateAsync({
          name: newCategory.name,
          color: newCategory.color,
        });
        setNewCategory({ name: '', color: '#7ac5be' });
        setIsAddModalOpen(false);
      } catch (error) {
        console.error('Failed to create category:', error);
      }
    }
  };

  const handleEditCategory = async (category: Category) => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        data: {
          name: category.name,
          color: category.color,
        },
      });
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 flex justify-center items-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ac5be]'></div>
      </div>
    );
  }

  if (isError) {
    return <>
          <div className='p-6'>Error loading categories</div>;
    <button
          onClick={() => setIsAddModalOpen(true)}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          Add Category

        </button>
    {isAddModalOpen && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              onClick={() => setIsAddModalOpen(false)}
            />

            <div className='relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
              <div className='absolute right-0 top-0 pr-4 pt-4'>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>

              <div className='mt-3 text-center sm:mt-0 sm:text-left'>
                <h3 className='text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100'>
                  Add New Category
                </h3>
                <div className='mt-4 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Category Name
                    </label>
                    <input
                      type='text'
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          name: e.target.value,
                        })
                      }
                      className='mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Color
                    </label>
                    <input
                      type='color'
                      value={newCategory.color}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          color: e.target.value,
                        })
                      }
                      className='mt-1 w-full'
                    />
                  </div>
                </div>
              </div>

              <div className='mt-5 sm:mt-4 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  onClick={handleAddCategory}
                  disabled={createCategoryMutation.isPending}
                  className='inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 sm:ml-3 sm:w-auto'
                >
                  {createCategoryMutation.isPending
                    ? 'Adding...'
                    : 'Add Category'}
                </button>
                <button
                  type='button'
                  onClick={() => setIsAddModalOpen(false)}
                  className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}</>

  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Categories
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Category Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Color
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className='px-6 py-8 text-center text-gray-500 dark:text-gray-400'
                >
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {editingCategory?.id === category.id ? (
                      <input
                        type='text'
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                        className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded'
                      />
                    ) : (
                      <span className='text-sm text-gray-900 dark:text-gray-100'>
                        {category.name}
                      </span>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-6 h-6 rounded border border-gray-300 dark:border-gray-600'
                        style={{ backgroundColor: category.color }}
                      />
                      {editingCategory?.id === category.id && (
                        <input
                          type='color'
                          value={editingCategory.color}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              color: e.target.value,
                            })
                          }
                          className='w-8 h-8'
                        />
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      {editingCategory?.id === category.id ? (
                        <>
                          <button
                            onClick={() => handleEditCategory(editingCategory)}
                            disabled={updateCategoryMutation.isPending}
                            className='text-green-600 hover:text-green-700 disabled:opacity-50'
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className='text-gray-600 hover:text-gray-700'
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingCategory(category)}
                            className='text-blue-600 hover:text-blue-700'
                          >
                            <Edit2 className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={deleteCategoryMutation.isPending}
                            className='text-red-600 hover:text-red-700 disabled:opacity-50'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              onClick={() => setIsAddModalOpen(false)}
            />

            <div className='relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6'>
              <div className='absolute right-0 top-0 pr-4 pt-4'>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className='text-gray-400 hover:text-gray-500'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>

              <div className='mt-3 text-center sm:mt-0 sm:text-left'>
                <h3 className='text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100'>
                  Add New Category
                </h3>
                <div className='mt-4 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Category Name
                    </label>
                    <input
                      type='text'
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          name: e.target.value,
                        })
                      }
                      className='mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                      Color
                    </label>
                    <input
                      type='color'
                      value={newCategory.color}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          color: e.target.value,
                        })
                      }
                      className='mt-1 w-full'
                    />
                  </div>
                </div>
              </div>

              <div className='mt-5 sm:mt-4 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  onClick={handleAddCategory}
                  disabled={createCategoryMutation.isPending}
                  className='inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 sm:ml-3 sm:w-auto'
                >
                  {createCategoryMutation.isPending
                    ? 'Adding...'
                    : 'Add Category'}
                </button>
                <button
                  type='button'
                  onClick={() => setIsAddModalOpen(false)}
                  className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
