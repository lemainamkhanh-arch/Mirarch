import React from 'react';
import { Project } from '../types';
import { MoreHorizontal, Image as ImageIcon } from 'lucide-react';

const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Khanh Le',
    client: 'Private Client',
    location: 'District 1',
    status: 'Construction',
    budget: 0, spent: 0,
    startDate: 'January 22, 2026',
    endDate: '',
    imageUrl: '', 
    progress: 0
  },
  {
    id: '2',
    name: 'Demo Project',
    client: 'Internal',
    location: '',
    status: 'Design',
    budget: 0, spent: 0,
    startDate: 'December 08, 2023',
    endDate: '',
    imageUrl: '',
    progress: 0
  },
  {
    id: '3',
    name: 'Interior Decor & Styling',
    client: 'Project Template',
    location: '',
    status: 'Planning',
    budget: 0, spent: 0,
    startDate: 'December 08, 2023',
    endDate: '',
    imageUrl: '',
    progress: 0
  },
  {
    id: '4',
    name: 'Interior Design & Arch.',
    client: 'Project Template',
    location: '',
    status: 'Planning',
    budget: 0, spent: 0,
    startDate: 'December 08, 2023',
    endDate: '',
    imageUrl: '',
    progress: 0
  }
];

interface ProjectListProps {
    onProjectClick?: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectClick }) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PROJECTS.map((project) => (
          <div 
            key={project.id} 
            onClick={() => onProjectClick?.(project)}
            className="group bg-white rounded-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer"
          >
            {/* Image Area */}
            <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-300">
                    {/* Placeholder Icon */}
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                </div>
              )}
              
              {/* Hover Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="bg-white p-1.5 rounded shadow-sm text-gray-600 hover:text-black"
                >
                   <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-1 truncate">{project.name}</h3>
              <p className="text-xs text-gray-500">{project.startDate}</p>
            </div>
          </div>
        ))}
        
        {/* Add Project Placeholder Card */}
         <div className="group bg-gray-50 rounded-sm border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[200px]">
             <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <span className="text-xl text-gray-400 font-light">+</span>
             </div>
             <p className="text-sm font-medium text-gray-500">Create New Project</p>
         </div>
      </div>
    </div>
  );
};

export default ProjectList;