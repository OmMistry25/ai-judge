import { useState } from 'react';

interface Judge {
  id?: string;
  name: string;
  system_prompt: string;
  provider: string;
  model: string;
  active: boolean;
}

interface JudgeFormProps {
  judge?: Judge;
  onSubmit: (judge: Omit<Judge, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function JudgeForm({ judge, onSubmit, onCancel, isLoading = false }: JudgeFormProps) {
  const [formData, setFormData] = useState({
    name: judge?.name || '',
    system_prompt: judge?.system_prompt || '',
    provider: judge?.provider || 'openai',
    model: judge?.model || 'gpt-4',
    active: judge?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Judge name is required';
    }

    if (!formData.system_prompt.trim()) {
      newErrors.system_prompt = 'System prompt is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting judge:', error);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {judge ? 'Edit AI Judge' : 'Create New AI Judge'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Judge Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Judge Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Helpfulness Judge"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* System Prompt */}
        <div>
          <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700 mb-1">
            System Prompt *
          </label>
          <textarea
            id="system_prompt"
            value={formData.system_prompt}
            onChange={(e) => handleChange('system_prompt', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.system_prompt ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="You are an AI judge that evaluates responses for helpfulness..."
            disabled={isLoading}
          />
          {errors.system_prompt && (
            <p className="mt-1 text-sm text-red-600">{errors.system_prompt}</p>
          )}
        </div>

        {/* Provider and Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              id="provider"
              value={formData.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
            </select>
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              id="model"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.model ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., gpt-4"
              disabled={isLoading}
            />
            {errors.model && (
              <p className="mt-1 text-sm text-red-600">{errors.model}</p>
            )}
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => handleChange('active', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Active (can be assigned to evaluations)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (judge ? 'Update Judge' : 'Create Judge')}
          </button>
        </div>
      </form>
    </div>
  );
}
