import { useState, useEffect } from 'react';
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
    Bars3Icon
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

    // Modal States
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [editingLecture, setEditingLecture] = useState(null);
    const [parentModuleId, setParentModuleId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Single API call to get all course data
            const response = await axios.get(`/api/courses/${courseId}/details`);
            setCourse(response.data);
            const sortedModules = (response.data.modules || []).sort((a, b) => a.order - b.order);
            setModules(sortedModules);
        } catch (error) {
            toast.error("Failed to load course content.");
            navigate(`/courses/${courseId}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [courseId]);

    // --- CRITICAL: Security Check ---
    // Redirect if the logged-in user is not the course instructor.
    useEffect(() => {
        if (course && user) {
            if (user.role !== 'instructor' || course.instructor !== user._id) {
                toast.error("You are not authorized to manage this course.");
                navigate(`/courses/${courseId}`);
            }
        }
    }, [course, user, navigate, courseId]);


    // --- Module & Lecture Handlers (No changes needed in these handlers) ---

    const handleAddModule = () => {
        setEditingModule(null);
        const nextOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order)) + 1 : 1;
        setEditingModule({ order: nextOrder });
        setIsModuleModalOpen(true);
    };

    const handleEditModule = (module) => {
        setEditingModule(module);
        setIsModuleModalOpen(true);
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm('WARNING: Deleting this module will delete ALL lectures inside it. Are you sure?')) {
            try {
                await axios.delete(`/api/modules/${moduleId}`);
                toast.success('Module deleted successfully');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete module.');
            }
        }
    };

    const handleAddLecture = (moduleId, currentLectures) => {
        setParentModuleId(moduleId);
        setEditingLecture(null);
        const nextOrder = currentLectures.length > 0 ? Math.max(...currentLectures.map(l => l.order)) + 1 : 1;
        setEditingLecture({ order: nextOrder });
        setIsLectureModalOpen(true);
    };

    const handleEditLecture = (lecture) => {
        setEditingLecture(lecture);
        setIsLectureModalOpen(true);
    };

    const handleDeleteLecture = async (lectureId) => {
        if (window.confirm('Are you sure you want to delete this lecture?')) {
            try {
                await axios.delete(`/api/lectures/${lectureId}`);
                toast.success('Lecture deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete lecture.');
            }
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'video': return PlayIcon;
            case 'link': return LinkIcon;
            default: return DocumentIcon;
        }
    };

    if (loading || !course) return <LoadingSpinner />;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Top Navigation and Header remain the same */}
            <div className="flex items-center justify-between">
                <Link to={`/courses/${courseId}`} className="btn btn-secondary flex items-center text-sm">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Course
                </Link>
                <div className="text-sm text-gray-500">
                    Status: <span className={`font-medium ${course.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                        {course.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                </div>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Curriculum Builder</h1>
                        <p className="text-gray-600 mt-1">Manage modules and lectures for <span className="font-semibold">{course.title}</span></p>
                    </div>
                    <button onClick={handleAddModule} className="mt-4 md:mt-0 btn btn-primary flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create New Module
                    </button>
                </div>
            </div>

            {/* Content Area and Modals remain the same */}
            <div className="space-y-6">
                {modules.length > 0 ? (
                    modules.map((module) => (
                        <div key={module._id} className="card border-l-4 border-l-blue-500">
                             {/* Module Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4">
                                <div className="flex items-start">
                                    <div className="mt-1 mr-3 cursor-grab text-gray-400">
                                        <Bars3Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                            <span className="text-sm font-bold text-gray-500 mr-2">Module {module.order}:</span>
                                            <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Status: {module.isPublished ? <span className="text-green-600">Published</span> : <span className="text-gray-500">Draft</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-3 sm:mt-0 ml-9 sm:ml-0">
                                    <button onClick={() => handleEditModule(module)} className="btn btn-secondary btn-sm flex items-center">
                                        <PencilIcon className="h-4 w-4 mr-1" /> Edit
                                    </button>
                                    <button onClick={() => handleDeleteModule(module._id)} className="btn btn-danger btn-sm flex items-center">
                                        <TrashIcon className="h-4 w-4 mr-1" /> Delete
                                    </button>
                                </div>
                            </div>

                             {/* Lectures List */}
                             <div className="space-y-2 ml-0 sm:ml-9">
                                {module.lectures && module.lectures.sort((a,b) => a.order - b.order).map((lecture) => {
                                    const Icon = getIconForType(lecture.contentType);
                                    return (
                                        <div key={lecture._id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 group">
                                            <div className="flex items-center space-x-3 flex-1">
                                                <Bars3Icon className="h-5 w-5 text-gray-400 cursor-grab" />
                                                <div className={`p-1.5 rounded ${lecture.isPublished ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center">
                                                        <span className="text-xs font-semibold text-gray-500 mr-2">{lecture.order}.</span>
                                                        <span className={`font-medium ${lecture.isPublished ? 'text-gray-900' : 'text-gray-500'}`}>{lecture.title}</span>
                                                        {!lecture.isPublished && ( <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Draft</span> )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditLecture(lecture)} className="p-1 text-gray-500 hover:text-blue-600 rounded"><PencilIcon className="h-5 w-5" /></button>
                                                <button onClick={() => handleDeleteLecture(lecture._id)} className="p-1 text-gray-500 hover:text-red-600 rounded"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>

                             {module.lectures && module.lectures.length > 0 && (
                                <div className="mt-4 ml-0 sm:ml-9">
                                    <button onClick={() => handleAddLecture(module._id, module.lectures)} className="btn btn-secondary btn-sm w-full border-dashed flex items-center justify-center text-gray-600">
                                        <PlusIcon className="h-4 w-4 mr-1" /> Add Lecture
                                    </button>
                                </div>
                             )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 card border-2 border-dashed">
                        <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Curriculum</h3>
                        <button onClick={handleAddModule} className="btn btn-primary px-6 mt-4">
                            <PlusIcon className="h-5 w-5 mr-2" /> Create First Module
                        </button>
                    </div>
                )}
            </div>

            {isModuleModalOpen && (
                <ModuleForm courseId={courseId} module={editingModule} onClose={() => setIsModuleModalOpen(false)} onSave={() => { setIsModuleModalOpen(false); fetchData(); }} />
            )}
            {isLectureModalOpen && (
                <LectureForm moduleId={editingLecture ? editingLecture.moduleId : parentModuleId} lecture={editingLecture} onClose={() => setIsLectureModalOpen(false)} onSave={() => { setIsLectureModalOpen(false); fetchData(); }}/>
            )}
        </div>
    );
};

export default ManageCourseContent;