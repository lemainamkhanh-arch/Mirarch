import React from 'react';
import { ViewMode } from '../types';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarDays, 
  Files, 
  Sparkles, 
  Search,
  ChevronDown,
  Clock,
  ListTodo,
  BookUser,
  Image as ImageIcon,
  Box,
  Plus
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  children: React.ReactNode;
  headerTitle?: React.ReactNode;
  headerActions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  setCurrentView, 
  children,
  headerTitle,
  headerActions
}) => {
  
  const toolsMenu = [
    { id: ViewMode.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewMode.SCHEDULE, label: 'Schedule', icon: CalendarDays },
    { id: ViewMode.DOCS, label: 'Specifications', icon: Files },
    { id: ViewMode.AI_STUDIO, label: 'AI Studio', icon: Sparkles },
  ];

  const libraryMenu = [
    { label: 'Address Book', icon: BookUser },
    { label: 'Image Library', icon: ImageIcon },
    { label: 'Product Library', icon: Box },
  ];

  const defaultHeaderTitle = (
    <h1 className="text-lg font-medium text-gray-900">
       {currentView === ViewMode.PROJECTS ? 'Projects' : 
        currentView === ViewMode.DASHBOARD ? 'Dashboard' :
        currentView === ViewMode.AI_STUDIO ? 'AI Studio' :
        currentView.charAt(0) + currentView.slice(1).toLowerCase()}
    </h1>
  );

  const defaultHeaderActions = (
    <div className="flex items-center gap-4">
      <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
        <Search size={20} strokeWidth={1.5} />
      </button>
      <div className="h-6 w-px bg-gray-200"></div>
      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
         <span className="text-xs">↓↑</span> Sort
      </button>
      <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm flex items-center gap-2">
        <Plus size={16} />
        Create New Project
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col border-r border-gray-200 flex-shrink-0 z-20">
        {/* Workspace Dropdown */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">Lily Studio</h2>
            <p className="text-xs text-gray-500 truncate">Le Mai Khanh</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {/* Main Section */}
          <div className="space-y-1">
             <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 cursor-pointer hover:text-black">
                <div className="w-2 h-2 rounded-full bg-black"></div>
                <span>Getting Started</span>
             </div>
             
             <button
                onClick={() => setCurrentView(ViewMode.PROJECTS)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === ViewMode.PROJECTS || currentView === ViewMode.PROJECT_DETAIL
                    ? 'bg-white border border-gray-200 shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FolderKanban size={18} strokeWidth={1.5} />
                Projects
              </button>
          </div>

          {/* Tools Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tools</h3>
            <div className="space-y-0.5">
              {toolsMenu.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900 font-medium' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    {item.label}
                  </button>
                );
              })}
              {/* Static Placeholders for visual match */}
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                <Clock size={18} strokeWidth={1.5} />
                Time Tracking
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                <ListTodo size={18} strokeWidth={1.5} />
                To-Do List
              </button>
            </div>
          </div>

          {/* Libraries Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Libraries</h3>
            <div className="space-y-0.5">
              {libraryMenu.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          
           {/* Bottom Links */}
           <div className="pt-4 border-t border-gray-100 space-y-1">
             <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 hover:text-gray-900">
               Project Guides <Files size={16} strokeWidth={1.5} />
             </button>
             <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 hover:text-gray-900">
               Guides & Docs <Files size={16} strokeWidth={1.5} />
             </button>
             <button className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-500 hover:text-gray-900">
               Talk to us 
               <div className="flex -space-x-1">
                 <div className="w-5 h-5 rounded-full bg-gray-200 border border-white"></div>
                 <div className="w-5 h-5 rounded-full bg-gray-300 border border-white"></div>
               </div>
             </button>
           </div>
        </div>

        {/* Upgrade Box */}
        <div className="p-4 border-t border-gray-100">
          <div className="mb-2 flex justify-between items-baseline">
             <h3 className="text-sm font-semibold text-gray-900">Upgrade your plan</h3>
             <span className="text-xs text-gray-900 font-medium">6 days left</span>
          </div>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            Upgrade to keep using schedules, procurement, and collaboration.
          </p>
          <button className="w-full bg-gray-900 hover:bg-black text-white text-sm font-medium py-2 rounded transition-colors shadow-sm">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10">
          {headerTitle || defaultHeaderTitle}
          {headerActions || defaultHeaderActions}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
          <div className="max-w-[1600px] mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;