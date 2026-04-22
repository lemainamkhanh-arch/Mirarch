import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import AIStudio from './components/AIStudio';
import { ViewMode, Project } from './types';
import { Maximize2, Minimize2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentView(ViewMode.PROJECT_DETAIL);
  };

  const handleViewChange = (view: ViewMode) => {
    // If navigating away from detail, clear selected project
    if (view !== ViewMode.PROJECT_DETAIL) {
      setSelectedProject(null);
    }
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewMode.DASHBOARD:
        return <Dashboard />;
      case ViewMode.PROJECTS:
        return <ProjectList onProjectClick={handleProjectClick} />;
      case ViewMode.PROJECT_DETAIL:
        return selectedProject ? <ProjectDetail project={selectedProject} /> : <ProjectList onProjectClick={handleProjectClick} />;
      case ViewMode.AI_STUDIO:
        return <AIStudio />;
      case ViewMode.SCHEDULE:
        return (
          <div className="flex items-center justify-center h-full text-gray-400 flex-col">
            <span className="text-6xl mb-4">📅</span>
            <p className="text-lg font-medium">Full Gantt Schedule Module</p>
            <p className="text-sm">Coming in v2.0</p>
          </div>
        );
      case ViewMode.DOCS:
        return (
           <div className="flex items-center justify-center h-full text-gray-400 flex-col">
            <span className="text-6xl mb-4">📄</span>
            <p className="text-lg font-medium">Specification & Document Manager</p>
            <p className="text-sm">Coming in v2.0</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  // Custom Header Props for Project Detail View
  let headerTitle;
  let headerActions;

  if (currentView === ViewMode.PROJECT_DETAIL && selectedProject) {
    headerTitle = (
      <div className="flex items-center gap-2 text-sm">
        <button 
          onClick={() => handleViewChange(ViewMode.PROJECTS)}
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          Projects
        </button>
        <span className="text-gray-300">/</span>
        <span className="font-bold text-gray-900">{selectedProject.name}</span>
      </div>
    );
    
    headerActions = (
      <div className="flex items-center gap-3">
         <button className="p-2 text-gray-400 hover:text-gray-900">
           <MoreHorizontalIcon />
         </button>
         <button className="p-2 text-gray-400 hover:text-gray-900">
           <PanelRightIcon />
         </button>
      </div>
    );
  }

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={handleViewChange}
      headerTitle={headerTitle}
      headerActions={headerActions}
    >
      {renderContent()}
    </Layout>
  );
};

// Simple icons for the header actions if not imported from lucide
const MoreHorizontalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
  </svg>
);

const PanelRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>
  </svg>
);

export default App;