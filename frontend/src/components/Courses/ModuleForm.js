import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ModuleForm = ({ courseId, module, onClose, onSave }) => {
    const isEditing = module && module._id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        order: 1,
        isPublished: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If editing, populate form. If creating, module might contain suggested 'order'
        if (module) {
            setFormData({
                title: module.title || '',
                description: module.description || '',
                order: module.order || 1,
                isPublished: module.isPublished !== undefined ? module.isPublished : false
            });
        }
    }, [module]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!formData.title.trim()) {
            toast.error("Title is required");
            return;
        }

        setLoading(true);

        const data = {
            ...formData,
            courseId,
            order: Number(formData.order)
        };

        try {
            if (isEditing) {
                await axios.put(`/api/modules/${module._id}`, data);
                toast.success('Module updated successfully');
            } else {
                await axios.post('/api/modules', data);
                toast.success('Module created successfully');
            }
            onSave();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to save module');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">
                        {isEditing ? 'Edit Module' : 'Create New Module'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Module Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input w-full"
                                placeholder="e.g., Introduction to the Course"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input w-full"
                                rows="3"
                                placeholder="What will students learn in this module?"
                            ></textarea>
                        </div>

                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order Sequence *
                                </label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleChange}
                                    className="input w-full"
                                    required
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">Position in the course.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                            <div>
                                <label htmlFor="isPublished" className="text-sm font-medium text-gray-900 block">Publish Module</label>
                                <p className="text-xs text-gray-500">Make visible to students immediately.</p>
                            </div>
                            
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="isPublished"
                                    name="isPublished"
                                    checked={formData.isPublished} 
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                    </div>
                    <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary min-w-[100px]">
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Saving...
                                </div>
                            ) : (
                                isEditing ? 'Update Module' : 'Create Module'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModuleForm;