import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { XMarkIcon, CloudArrowUpIcon, VideoCameraIcon, LinkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const LectureForm = ({ moduleId, lecture, onClose, onSave }) => {
    const isEditing = lecture && lecture._id;
    const [formData, setFormData] = useState({ title: '', description: '', order: 1, contentType: 'video', contentUrl: '', duration: 10, isPublished: false });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (lecture) {
            setFormData({ title: lecture.title || '', description: lecture.description || '', order: lecture.order || 1, contentType: lecture.contentType || 'video', contentUrl: lecture.contentUrl || '', duration: lecture.duration || 0, isPublished: lecture.isPublished !== undefined ? lecture.isPublished : false });
        }
    }, [lecture]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 500 * 1024 * 1024) { toast.error('File size too large (Max 500MB)'); return; }
            setFile(selectedFile);
            if (!formData.title) {
                const title = selectedFile.name.replace(/\.[^/.]+$/, "");
                setFormData(prev => ({...prev, title: title}));
            }
        }
    };

    const uploadFile = async () => {
        if (!file) return formData.contentUrl;
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('type', formData.contentType === 'video' ? 'course-video' : 'course-document');
        try {
            const response = await axios.post('/api/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
            return response.data.url || response.data.filePath;
        } catch (error) {
            console.error("Upload failed", error);
            throw new Error('File upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.title.trim()) { toast.error("Title is required"); return; }
        if (!file && !formData.contentUrl.trim()) { toast.error("Please provide content (URL or File Upload)"); return; }
        setLoading(true);

        try {
            let finalUrl = formData.contentUrl;
            if (file) {
                finalUrl = await uploadFile();
            }
            const data = { ...formData, contentUrl: finalUrl, moduleId, order: Number(formData.order), duration: Number(formData.duration) };

            if (isEditing) {
                // FIX: Use POST for updates, as required by your backend lecture routes
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
    
    const TypeIcon = formData.contentType === 'video' ? VideoCameraIcon : formData.contentType === 'document' ? DocumentTextIcon : LinkIcon;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 transform transition-all">
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center"><TypeIcon className="h-6 w-6 mr-2 text-blue-600" />{isEditing ? 'Edit Lecture' : 'Add New Lecture'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['video', 'document', 'link'].map((type) => (<button key={type} type="button" onClick={() => setFormData(prev => ({...prev, contentType: type}))} className={`flex items-center justify-center px-4 py-3 border rounded-lg capitalize font-medium ${formData.contentType === type ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>{type}</button>))}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Content Source</h4>
                            {formData.contentType !== 'link' && (<div className="mb-4"><label className="block text-sm text-gray-600 mb-1">Upload File {file && <span className="text-green-600 font-bold ml-2">✓ Selected</span>}</label><div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-blue-400 bg-white'}`}><input type="file" id="file-upload" onChange={handleFileChange} className="hidden" accept={formData.contentType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.txt'} /><label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center"><CloudArrowUpIcon className={`h-8 w-8 mb-2 ${file ? 'text-green-500' : 'text-gray-400'}`} /><span className="text-sm font-medium text-gray-700">{file ? file.name : 'Click to upload or drag and drop'}</span><span className="text-xs text-gray-500 mt-1">{formData.contentType === 'video' ? 'MP4, MOV, etc.' : 'PDF, DOC, etc.'}</span></label></div></div>)}
                            {formData.contentType !== 'link' && (<div className="relative flex py-2 items-center"><div className="flex-grow border-t border-gray-300"></div><span className="flex-shrink-0 mx-4 text-xs text-gray-500 font-semibold uppercase">OR use URL</span><div className="flex-grow border-t border-gray-300"></div></div>)}
                            <div><label className="block text-sm text-gray-600 mb-1">External URL {formData.contentType === 'link' && '*'}</label><div className="relative rounded-md shadow-sm"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LinkIcon className="h-5 w-5 text-gray-400" /></div><input type="url" name="contentUrl" value={formData.contentUrl} onChange={handleChange} disabled={!!file} className={`input w-full pl-10 ${file ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder={formData.contentType === 'video' ? 'https://youtube.com/...' : 'https://...'} required={formData.contentType === 'link' || (!file && !isEditing)} /></div>{file && <p className="text-xs text-orange-600 mt-1">File selected. URL input is disabled.</p>}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="md:col-span-2"><label className="label">Lecture Title *</label><input type="text" name="title" value={formData.title} onChange={handleChange} className="input w-full" required placeholder="e.g., Understanding the Basics" /></div><div><label className="label">Order in Module *</label><input type="number" name="order" value={formData.order} onChange={handleChange} className="input w-full" required min="1" /></div><div><label className="label">Est. Duration (mins)</label><input type="number" name="duration" value={formData.duration} onChange={handleChange} className="input w-full" min="0" /></div><div className="md:col-span-2"><label className="label">Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="input w-full" rows="2" placeholder="Brief summary..."></textarea></div></div>
                        <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between"><div><label htmlFor="isPublishedLect" className="text-sm font-medium text-gray-900 block">Publish Lecture</label><p className="text-xs text-gray-500">Visible to students when module is also published.</p></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" id="isPublishedLect" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label></div>
                    </div>
                    <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading || uploading}>Cancel</button>
                        <button type="submit" disabled={loading || uploading} className="btn btn-primary min-w-[120px]">{uploading ? <div className="flex items-center justify-center"><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Uploading...</div> : loading ? <div className="flex items-center justify-center"><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Saving...</div> : isEditing ? 'Update Lecture' : 'Create Lecture'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LectureForm;