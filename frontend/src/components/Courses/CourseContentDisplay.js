import { useState } from 'react';
import {
    DocumentIcon,
    PlayIcon,
    LinkIcon,
    LockClosedIcon,
    ChevronDownIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

const CourseContentDisplay = ({
    modules,
    isEnrolled,
    canEdit, // Represents if the user is the course owner/instructor
    isAdmin, // Received from parent component
    onEnroll,
    enrollmentLoading,
    courseApproved,
    userRole
}) => {
    const [openModule, setOpenModule] = useState(modules && modules.length > 0 ? modules[0]._id : null);

    const getIconForType = (type) => {
        switch (type) {
            case 'video': return PlayIcon;
            case 'link': return LinkIcon;
            case 'document': return DocumentIcon;
            default: return DocumentIcon;
        }
    };

    const toggleModule = (moduleId) => {
        setOpenModule(openModule === moduleId ? null : moduleId);
    };

    if (!modules || modules.length === 0) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Curriculum Coming Soon</h3>
                    <p className="text-gray-600">The instructor is building the content for this course.</p>
                </div>
            </div>
        );
    }
    
    const totalModules = modules.length;
    const totalLectures = modules.reduce((acc, module) => acc + (module.lectures ? module.lectures.length : 0), 0);

    return (
        <div className="card">
            <div className="mb-4 border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Course Curriculum</h2>
                <p className="text-sm text-gray-600 mt-1">{totalModules} modules • {totalLectures} lectures</p>
            </div>
            <div className="space-y-3">
                {modules.map((module, index) => {
                    const isOpen = openModule === module._id;
                    // A module is visible if the user is instructor, admin, or if it's published
                    const isModuleVisible = canEdit || isAdmin || module.isPublished;

                    return (
                        <div key={module._id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={() => toggleModule(module._id)} className={`w-full p-4 text-left flex justify-between items-center transition-colors ${isOpen ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 mr-4">
                                        {!isModuleVisible && <LockClosedIcon className="h-5 w-5 text-gray-400" />}
                                        {isModuleVisible && <span className="font-bold text-lg text-blue-500">{index + 1}</span>}
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold ${isModuleVisible ? 'text-gray-800' : 'text-gray-500'}`}>{module.title}</h3>
                                        {/* Badge for instructor/admin to identify unpublished content */}
                                        {!module.isPublished && (canEdit || isAdmin) && 
                                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Draft</span>
                                        }
                                    </div>
                                </div>
                                <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                                <div className="bg-white border-t border-gray-200">
                                    <ul className="divide-y divide-gray-100">
                                        {(module.lectures || []).map((lecture) => {
                                            const Icon = getIconForType(lecture.contentType);
                                            // Access is granted to instructor, admin, or enrolled students for published content
                                            const canAccess = canEdit || isAdmin || (isEnrolled && module.isPublished && lecture.isPublished);

                                            return (
                                                <li key={lecture._id} className={`p-4 transition-colors ${canAccess ? 'hover:bg-gray-50' : 'bg-gray-50'}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3 flex-1">
                                                            <Icon className={`h-5 w-5 ${canAccess ? 'text-blue-600' : 'text-gray-400'}`} />
                                                            <div>
                                                                <p className={`font-medium ${canAccess ? 'text-gray-900' : 'text-gray-500'}`}>{lecture.title}</p>
                                                                {/* Badge for instructor/admin to identify unpublished lectures */}
                                                                {!lecture.isPublished && (canEdit || isAdmin) && 
                                                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Draft</span>
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            {canAccess ? (
                                                                <a href={lecture.contentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Start</a>
                                                            ) : (
                                                                <div className="flex items-center text-gray-400 text-sm"><LockClosedIcon className="h-4 w-4 mr-1" /> Locked</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {userRole === 'student' && !isEnrolled && courseApproved && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                   <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900">Unlock Full Access</h3>
                            <p className="text-blue-700 mt-1">Enroll to access all {totalLectures} lectures and course materials.</p>
                        </div>
                        <button onClick={onEnroll} disabled={enrollmentLoading} className="btn btn-primary whitespace-nowrap">
                            {enrollmentLoading ? 'Processing...' : 'Enroll in Course'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseContentDisplay;