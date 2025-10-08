import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { XMarkIcon, PlusIcon, TrashIcon, VideoCameraIcon, LinkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const LectureForm = ({ moduleId, lecture, onClose, onSave }) => {
    const isEditing = lecture && lecture._id;

    // --- STATE CHANGES ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState(1);
    const [isPublished, setIsPublished] = useState(false);
    // State to manage an array of resource objects
    const [resources, setResources] = useState([{ type: 'video', url: '', duration: 0 }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (lecture) {
            setTitle(lecture.title || '');
            setDescription(lecture.description || '');
            setOrder(lecture.order || 1);
            setIsPublished(lecture.isPublished || false);
            // If editing, populate with existing resources, otherwise start with one empty video resource
            setResources(lecture.resources && lecture.resources.length > 0 ? lecture.resources : [{ type: 'video', url: '', duration: 0 }]);
        }
    }, [lecture]);

    // --- HANDLERS FOR MANAGING RESOURCES ARRAY ---
    const handleResourceChange = (index, field, value) => {
        const newResources = [...resources];
        if (field === 'duration') {
            newResources[index][field] = parseInt(value) || 0;
        } else {
            newResources[index][field] = value;
        }
        setResources(newResources);
    };

    const addResource = () => {
        setResources([...resources, { type: 'video', url: '', duration: 0 }]);
    };

    const removeResource = (index) => {
        if (resources.length <= 1) {
            toast.error("A lecture must have at least one resource.");
            return;
        }
        const newResources = resources.filter((_, i) => i !== index);
        setResources(newResources);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!title.trim()) { toast.error("Lecture Title is required"); return; }
        if (!moduleId) { toast.error("Critical Error: Module ID is missing."); return; }
        
        // Validate that every resource has a URL
        for (const resource of resources) {
            if (!resource.url.trim()) {
                toast.error(`Please provide a URL for all resources.`);
                return;
            }
        }

        setLoading(true);
        try {
            // --- PAYLOAD CHANGE ---
            const data = {
                title,
                description,
                order: Number(order),
                isPublished,
                moduleId,
                resources // The array of resource objects
            };

            if (isEditing) {
                await axios.post(`/api/lectures/${lecture._id}`, data);
                toast.success('Lecture updated successfully');
            } else {
                await axios.post('/api/lectures', data);
                toast.success('Lecture created successfully');
            }
            onSave();
        } catch (error) {
            console.error("Lecture save error:", error);
            toast.error(error.response?.data?.message || 'Failed to save lecture');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 transform transition-all">
                <div className="p-5 border-b flex justify-between items-center"><h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Lecture' : 'Add New Lecture'}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><XMarkIcon className="h-6 w-6" /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* --- General Lecture Details --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-3"><label className="label">Lecture Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input w-full" required placeholder="e.g., Introduction to Neural Networks" /></div>
                            <div><label className="label">Order in Module *</label><input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="input w-full" required min="1" /></div>
                        </div>
                        <div><label className="label">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input w-full" rows="3" placeholder="What will students learn in this lecture?"></textarea></div>

                        {/* --- Dynamic Resources Section --- */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-t pt-4">Lecture Resources</h3>
                            {resources.map((resource, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-gray-700">Resource #{index + 1}</p>
                                        <button type="button" onClick={() => removeResource(index)} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50" disabled={resources.length <= 1}>
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                        <div className="md:col-span-2">
                                            <label className="label text-sm">Type</label>
                                            <select value={resource.type} onChange={(e) => handleResourceChange(index, 'type', e.target.value)} className="input w-full text-sm">
                                                <option value="video">Video</option>
                                                <option value="document">Document</option>
                                                <option value="link">External Link</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="label text-sm">URL *</label>
                                            <input type="url" value={resource.url} onChange={(e) => handleResourceChange(index, 'url', e.target.value)} className="input w-full text-sm" placeholder="https://..." required />
                                        </div>
                                    </div>
                                    {resource.type === 'video' && (
                                        <div>
                                            <label className="label text-sm">Duration (minutes)</label>
                                            <input type="number" value={resource.duration} onChange={(e) => handleResourceChange(index, 'duration', e.target.value)} className="input w-full text-sm" min="0" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addResource} className="btn btn-secondary w-full border-dashed flex items-center justify-center"><PlusIcon className="h-4 w-4 mr-1" />Add Another Resource</button>
                        </div>

                        <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                            <div><label htmlFor="isPublishedLect" className="text-sm font-medium text-gray-900 block">Publish Lecture</label><p className="text-xs text-gray-500">Visible to students when module is also published.</p></div>
                            <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="isPublishedLect" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
                        </div>
                    </div>
                    <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary min-w-[120px]">{loading ? 'Saving...' : isEditing ? 'Update Lecture' : 'Create Lecture'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LectureForm;