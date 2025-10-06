import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    // materials: [] // REMOVED
  });

  const categories = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 
    'Biology', 'English', 'History', 'Arts', 'Business', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // --- Prerequisite Handling ---
  const handlePrerequisiteChange = (index, value) => {
    const newPrerequisites = [...formData.prerequisites];
    newPrerequisites[index] = value;
    setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
  };

  const addPrerequisite = () => {
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, '']
    }));
  };

  const removePrerequisite = (index) => {
    const newPrerequisites = formData.prerequisites.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, prerequisites: newPrerequisites }));
  };
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up prerequisites before sending
      const cleanedData = {
        ...formData,
        prerequisites: formData.prerequisites.filter(p => p.trim() !== ''),
      };

      // 1. Create the Course
      const response = await axios.post('/api/courses', cleanedData);
      const newCourseId = response.data.course?._id || response.data._id; // Handle potential API response variations

      toast.success('Course created successfully! Redirecting to curriculum builder...');
      
      // 2. Redirect to the new Content Management Page
      setTimeout(() => {
          navigate(`/courses/${newCourseId}/manage-content`);
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create course. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Progress Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
            <BookOpenIcon className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
          Step 1 of 2: Set up the course information. In the next step, you will build the curriculum (modules and lectures).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="card border-t-4 border-t-blue-500">
          <div className="border-b pb-4 mb-6">
             <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
             <p className="text-sm text-gray-500 mt-1">Details that will be displayed on the course catalog.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">Course Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input text-lg"
                placeholder="e.g., Complete Web Development Bootcamp 2024"
              />
            </div>

            <div>
              <label className="label">Course Code *</label>
              <input
                type="text"
                name="courseCode"
                required
                value={formData.courseCode}
                onChange={handleChange}
                className="input uppercase"
                placeholder="e.g., WEB101"
              />
            </div>

            <div>
              <label className="label">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4 md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <div>
                <label className="label text-sm">Level *</label>
                <select name="level" required value={formData.level} onChange={handleChange} className="input text-sm">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                </div>

                <div>
                <label className="label text-sm">Credits *</label>
                <input type="number" name="credits" required min="1" max="10" value={formData.credits} onChange={handleChange} className="input text-sm" />
                </div>

                <div>
                <label className="label text-sm">Max Students *</label>
                <input type="number" name="maxStudents" required min="1" value={formData.maxStudents} onChange={handleChange} className="input text-sm" />
                </div>
            </div>

            <div className="md:col-span-2">
              <label className="label">Course Fees ($) *</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="fees"
                    required
                    min="0"
                    value={formData.fees}
                    onChange={handleChange}
                    className="input pl-7"
                    placeholder="0.00"
                  />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter 0 for free courses.</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Description *</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="input"
              placeholder="Detailed description of what students will learn..."
            />
          </div>
        </div>

        {/* Prerequisites */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Prerequisites</h2>
                <p className="text-sm text-gray-500 mt-1">Skills or knowledge required before taking this course.</p>
            </div>
            <button
              type="button"
              onClick={addPrerequisite}
              className="btn btn-secondary btn-sm flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Requirement
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center space-x-3 group">
                <span className="text-gray-400 text-sm font-medium w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={prereq}
                  onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                  className="input flex-1"
                  placeholder="e.g., Basic understanding of JavaScript"
                />
                <button
                  type="button"
                  onClick={() => removePrerequisite(index)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 opacity-50 group-hover:opacity-100 transition-opacity"
                  disabled={formData.prerequisites.length === 1 && !prereq} // Prevent deleting last empty
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Area */}
        <div className="sticky bottom-4 bg-white p-4 shadow-lg rounded-xl border border-gray-200 flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="btn btn-secondary text-gray-600"
          >
            Cancel
          </button>
          <div className="flex items-center">
              <p className="text-sm text-gray-500 mr-4 hidden sm:block">Next: Build Curriculum</p>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary px-8 py-3 text-lg shadow-md hover:shadow-lg transform transition-transform active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                    </span>
                ) : (
                    'Create & Continue →'
                )}
              </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;