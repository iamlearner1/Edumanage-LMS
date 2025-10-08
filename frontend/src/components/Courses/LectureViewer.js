import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { DocumentIcon, PlayIcon, LinkIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const LectureViewer = () => {
    const { courseId, lectureId } = useParams();
    const location = useLocation();
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [moduleTitle, setModuleTitle] = useState('');

    useEffect(() => {
        const passedModuleTitle = location.state?.moduleTitle;
        if (passedModuleTitle) {
            setModuleTitle(passedModuleTitle);
        }

        const fetchLectureDetails = async () => {
            setLoading(true);
            try {
                const lectureResponse = await axios.get(`/api/lectures/${lectureId}`);
                const lectureData = lectureResponse.data;
                setLecture(lectureData);

                if (!passedModuleTitle && lectureData && lectureData.moduleId) {
                    try {
                        const moduleResponse = await axios.get(`/api/modules/${lectureData.moduleId}`);
                        setModuleTitle(moduleResponse.data.title);
                    } catch (moduleError) {
                        console.error("Fallback failed to fetch parent module:", moduleError);
                        setModuleTitle("Unknown Module");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch lecture details:", error);
                toast.error("Could not load lecture content.");
            } finally {
                setLoading(false);
            }
        };
        fetchLectureDetails();
    }, [lectureId, location.state]);

    const handleMarkAsCompleted = () => {
        toast.success(`"${lecture.title}" marked as complete!`);
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'video': return PlayIcon;
            case 'link': return LinkIcon;
            case 'document': return DocumentIcon;
            default: return DocumentIcon;
        }
    };

    if (loading) { return <LoadingSpinner />; }
    if (!lecture) { return ( <div className="text-center py-12"><h2>Lecture Not Found</h2><Link to={`/courses/${courseId}`} className="mt-4 btn btn-primary">Back to Course</Link></div> ); }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link to={`/courses/${courseId}`} className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-2"><ArrowLeftIcon className="h-4 w-4 mr-1" />Back to Course Curriculum</Link>
                {moduleTitle && (<p className="text-sm font-semibold text-blue-600">{moduleTitle}</p>)}
                <div className="mt-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
                    <button onClick={handleMarkAsCompleted} className="mt-3 md:mt-0 btn btn-primary flex items-center justify-center shrink-0"><CheckCircleIcon className="h-5 w-5 mr-2" />Mark as Completed</button>
                </div>
            </div>
            <div className="card space-y-8">
                <div><h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">About this lecture</h2><p className="text-gray-700 leading-relaxed prose">{lecture.description || "No description provided for this lecture."}</p></div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Lecture Resources ({lecture.resources?.length || 0})</h2>
                    {lecture.resources && lecture.resources.length > 0 ? (
                        <div className="space-y-3">
                            {lecture.resources.map(resource => {
                                const Icon = getIconForType(resource.type);
                                return (
                                    <a key={resource._id} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all group">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-blue-100 rounded-full"><Icon className="h-6 w-6 text-blue-600" /></div>
                                            <div><p className="font-semibold text-gray-900 capitalize">{resource.type}</p>{resource.duration > 0 && (<p className="text-sm text-gray-500">{resource.duration} minutes</p>)}</div>
                                        </div>
                                        <span className="btn btn-secondary btn-sm opacity-80 group-hover:opacity-100 transition-transform group-hover:scale-105">Open Resource</span>
                                    </a>
                                );
                            })}
                        </div>
                    ) : (<p className="text-center text-gray-500 py-6">No resources are available for this lecture.</p>)}
                </div>
            </div>
        </div>
    );
};

export default LectureViewer;