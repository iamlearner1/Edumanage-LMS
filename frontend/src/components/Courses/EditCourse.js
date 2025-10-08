import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Common/LoadingSpinner';

const EditCourse = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseCode: '',
        credits: 3,
        maxStudents: 30,
        fees: 0,
        category: '',
        level: 'Beginner',
        prerequisites: [''],
    });

    const categories = [ 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Arts', 'Business', 'Other' ];

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await axios.get(`/api/courses/${courseId}`);
                const course = response.data;
                // Security check: ensure the editor is the owner
                if (user && course.instructor !== user._id) {
                    toast.error("You are not authorized to edit this course.");
                    navigate(`/courses/${courseId}`);
                    return;
                }
                setFormData({
                    title: course.title,
                    description: course.description,
                    courseCode: course.courseCode,
                    credits: course.credits,
                    maxStudents: course.maxStudents,
                    fees: course.fees,
                    category: course.category,
                    level: course.level,
                    prerequisites: course.prerequisites.length > 0 ? course.prerequisites : [''],
                });
            } catch (error) {
                toast.error("Failed to load course data.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, navigate, user]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handlePrerequisiteChange = (index, value) => {
        const newPrerequisites = [...formData.prerequisites];
        newPrerequisites[index] = value;
        setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
    };

    const addPrerequisite = () => {
        setFormData(prev => ({ ...prev, prerequisites: [...prev.prerequisites, ''] }));
    };

    const removePrerequisite = (index) => {
        const newPrerequisites = formData.prerequisites.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const cleanedData = { ...formData, prerequisites: formData.prerequisites.filter(p => p.trim() !== '') };
            // Assuming your backend uses PUT for updates on /api/courses/:id
            await axios.put(`/api/courses/${courseId}`, cleanedData);
            toast.success('Course updated successfully!');
            navigate(`/courses/${courseId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update course.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-6">
                <Link to={`/courses/${courseId}`} className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Course
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Edit Course Information</h1>
                <p className="mt-2 text-gray-600">Update the details for your course. To manage modules and lectures, use the "Manage Content" page.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2"><label className="label">Course Title *</label><input type="text" name="title" required value={formData.title} onChange={handleChange} className="input" /></div>
                        <div><label className="label">Course Code *</label><input type="text" name="courseCode" required value={formData.courseCode} onChange={handleChange} className="input uppercase" /></div>
                        <div><label className="label">Category *</label><select name="category" required value={formData.category} onChange={handleChange} className="input"><option value="">Select Category</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className="label">Level *</label><select name="level" required value={formData.level} onChange={handleChange} className="input"><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
                        <div><label className="label">Credits *</label><input type="number" name="credits" required min="1" max="10" value={formData.credits} onChange={handleChange} className="input" /></div>
                        <div><label className="label">Max Students *</label><input type="number" name="maxStudents" required min="1" value={formData.maxStudents} onChange={handleChange} className="input" /></div>
                        <div><label className="label">Course Fees ($) *</label><input type="number" name="fees" required min="0" value={formData.fees} onChange={handleChange} className="input" /></div>
                        <div className="md:col-span-2"><label className="label">Description *</label><textarea name="description" required rows={5} value={formData.description} onChange={handleChange} className="input" /></div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold text-gray-900">Prerequisites</h2><button type="button" onClick={addPrerequisite} className="btn btn-secondary btn-sm flex items-center"><PlusIcon className="h-4 w-4 mr-1" />Add</button></div>
                    <div className="space-y-3">
                        {formData.prerequisites.map((p, i) => (<div key={i} className="flex items-center space-x-3"><input type="text" value={p} onChange={(e) => handlePrerequisiteChange(i, e.target.value)} className="input flex-1" /><button type="button" onClick={() => removePrerequisite(i)} className="btn btn-danger btn-sm p-2"><TrashIcon className="h-4 w-4" /></button></div>))}
                    </div>
                </div>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => navigate(`/courses/${courseId}`)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn btn-primary min-w-[120px]">{submitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
};

export default EditCourse;