import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    BookOpenIcon,
    ArrowLeftIcon,
    DocumentIcon,
    PlayIcon,
    LinkIcon,
    Bars3Icon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import ModuleForm from './ModuleForm';
import LectureForm from './LectureForm';

const ManageCourseContent = () => {
    const { id: courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);

    // Use a single state object for the lecture modal to prevent race conditions
    const [lectureModalState, setLectureModalState] = useState({
        isOpen: false,
        moduleId: null,
        lectureToEdit: null,
    });
    
    // State for the Module modal
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get(`/api/courses/${courseId}/details`);
            setCourse(response.data);
            const sortedModules = (response.data.modules || []).sort((a, b) => a.order - b.order);
            setModules(sortedModules);
        } catch (error) {
            toast.error("Failed to load course content.");
            navigate(`/courses/${courseId}`);
        } finally {
            if (loading) setLoading(false);
        }
    }, [courseId, navigate, loading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Security Check: Ensure only the instructor who owns the course can access this page
    useEffect(() => {
        if (course && user) {
            if (user.role !== 'instructor' || course.instructor !== user._id) {
                toast.error("You are not authorized to manage this course.");
                navigate(`/courses/${courseId}`);
            }
        }
    }, [course, user, navigate, courseId]);

    const handleToggleModulePublish = async (module) => {
        setTogglingId(module._id);
        const newStatus = !module.isPublished;
        try {
            // Your module routes use PATCH, which is correct
            await axios.patch(`/api/modules/${module._id}/publish`, { isPublished: newStatus });
            toast.success(`Module is now ${newStatus ? 'published' : 'hidden'}.`);
            setModules(prev => prev.map(m => m._id === module._id ? { ...m, isPublished: newStatus } : m));
        } catch (error) {
            toast.error('Failed to update module status.');
        } finally {
            setTogglingId(null);
        }
    };
    
    const handleToggleLecturePublish = async (lecture) => {
        setTogglingId(lecture._id);
        const newStatus = !lecture.isPublished;
        try {
            // FIX: Use POST to match your backend lecture routes
            await axios.post(`/api/lectures/${lecture._id}/publish`, { isPublished: newStatus });
            toast.success(`Lecture is now ${newStatus ? 'published' : 'hidden'}.`);
            setModules(prev => prev.map(mod => ({...mod, lectures: mod.lectures.map(lec => lec._id === lecture._id ? { ...lec, isPublished: newStatus } : lec)})));
        } catch (error) {
            toast.error('Failed to update lecture status.');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteLecture = async (lectureId) => {
        if (window.confirm('Are you sure you want to delete this lecture?')) {
            try {
                // FIX: Use POST to match your backend lecture routes
                await axios.post(`/api/lectures/${lectureId}/delete`);
                toast.success('Lecture deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete lecture.');
            }
        }
    };

    const handleAddModule = () => {
        const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order)) + 1 : 1;
        setEditingModule({ order: nextOrder }); // Pass suggested order
        setIsModuleModalOpen(true);
    };

    const handleEditModule = (module) => {
        setEditingModule(module);
        setIsModuleModalOpen(true);
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm('WARNING: Deleting this module will delete ALL lectures inside it. Are you sure?')) {
            try {
                // Your module routes use DELETE, which is correct
                await axios.delete(`/api/modules/${moduleId}`);
                toast.success('Module deleted successfully');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete module.');
            }
        }
    };
    
    const handleAddLecture = (moduleId) => {
        setLectureModalState({ isOpen: true, moduleId: moduleId, lectureToEdit: null });
    };

    const handleEditLecture = (lecture) => {
        setLectureModalState({ isOpen: true, moduleId: lecture.moduleId, lectureToEdit: lecture });
    };

    const closeLectureModal = () => {
        setLectureModalState({ isOpen: false, moduleId: null, lectureToEdit: null });
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'video': return PlayIcon;
            case 'link': return LinkIcon;
            default: return DocumentIcon;
        }
    };

    if (loading || !course) { return <LoadingSpinner />; }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex items-center justify-between">
                <Link to={`/courses/${courseId}`} className="btn btn-secondary flex items-center text-sm">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Course
                </Link>
                <div className="text-sm text-gray-500">
                    Status: <span className={`font-medium ${course.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>{course.isApproved ? 'Approved' : 'Pending Approval'}</span>
                </div>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Curriculum Builder</h1>
                        <p className="text-gray-600 mt-1">Manage modules and lectures for <span className="font-semibold">{course.title}</span></p>
                    </div>
                    <button onClick={handleAddModule} className="mt-4 md:mt-0 btn btn-primary flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />Create New Module
                    </button>
                </div>
            </div>
            
            <div className="space-y-6">
                {modules.length > 0 ? modules.map((module) => (
                    <div key={module._id} className={`card border-l-4 transition-colors ${module.isPublished ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4">
                            <div className="flex items-start">
                                <div className="mt-1 mr-3 text-gray-400 cursor-grab"><Bars3Icon className="h-6 w-6" /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 mt-3 sm:mt-0 ml-9 sm:ml-0">
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-semibold ${module.isPublished ? 'text-green-600' : 'text-gray-500'}`}>{module.isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={module.isPublished} onChange={() => handleToggleModulePublish(module)} disabled={togglingId === module._id} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                                <button onClick={() => handleEditModule(module)} className="btn btn-secondary btn-sm"><PencilIcon className="h-4 w-4" /></button>
                                <button onClick={() => handleDeleteModule(module._id)} className="btn btn-danger btn-sm"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                        <div className="space-y-2 ml-0 sm:ml-9">
                            {module.lectures && module.lectures.sort((a,b) => a.order - b.order).map((lecture) => {
                                const Icon = getIconForType(lecture.contentType);
                                return (
                                    <div key={lecture._id} className={`flex items-center justify-between p-3 rounded-md border group transition-all ${lecture.isPublished ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-200 opacity-80'}`}>
                                        <div className="flex items-center space-x-3 flex-1">
                                            <Icon className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium text-gray-800">{lecture.title}</span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleToggleLecturePublish(lecture)} disabled={togglingId === lecture._id} className={`btn btn-sm w-24 flex justify-center ${lecture.isPublished ? 'btn-secondary' : 'btn-primary'}`}>
                                                {togglingId === lecture._id ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : lecture.isPublished ? <><EyeSlashIcon className="h-4 w-4 mr-1" /> Hide</> : <><EyeIcon className="h-4 w-4 mr-1" /> Publish</>}
                                            </button>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditLecture(lecture)} className="p-1 text-gray-500 hover:text-blue-600 rounded"><PencilIcon className="h-5 w-5" /></button>
                                                <button onClick={() => handleDeleteLecture(lecture._id)} className="p-1 text-gray-500 hover:text-red-600 rounded"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="pt-2">
                                <button onClick={() => handleAddLecture(module._id)} className="btn btn-secondary btn-sm w-full border-dashed flex items-center justify-center text-gray-600">
                                    <PlusIcon className="h-4 w-4 mr-1" /> Add Lecture to Module
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 card border-2 border-dashed">
                        <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Curriculum</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">Courses are organized into Modules, which contain Lectures. Create your first module to begin.</p>
                        <button onClick={handleAddModule} className="btn btn-primary px-6">
                            <PlusIcon className="h-5 w-5 mr-2" /> Create First Module
                        </button>
                    </div>
                )}
            </div>
            
            {isModuleModalOpen && (
                <ModuleForm
                    courseId={courseId}
                    module={editingModule}
                    onClose={() => setIsModuleModalOpen(false)}
                    onSave={() => { setIsModuleModalOpen(false); fetchData(); }}
                />
            )}
            
            {lectureModalState.isOpen && (
                <LectureForm
                    moduleId={lectureModalState.moduleId}
                    lecture={lectureModalState.lectureToEdit}
                    onClose={closeLectureModal}
                    onSave={() => { closeLectureModal(); fetchData(); }}
                />
            )}
        </div>
    );
};

export default ManageCourseContent;