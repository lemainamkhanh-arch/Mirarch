import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectItem } from '../types';
import { generateSlideLayout, enhanceDocumentContent, editImageWithAI } from '../services/geminiService';
import { 
  FileText, 
  Layers, 
  MoreHorizontal,
  ArrowUpDown,
  SlidersHorizontal,
  SquareKanban,
  LayoutTemplate,
  Plus,
  X,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  ChevronLeft,
  Star,
  ArrowUpAZ,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Type,
  Image as ImageIcon,
  Download,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Grid,
  Folder,
  ListOrdered,
  Minus,
  Strikethrough,
  CheckSquare,
  GripVertical,
  LayoutDashboard,
  Sparkles,
  Printer,
  Palette,
  Trash2,
  Move,
  Crop,
  Square,
  RectangleHorizontal,
  Maximize,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Briefcase,
  GanttChartSquare,
  Table as TableIcon,
  CalendarDays,
  Armchair,
  Search,
  Filter,
  DollarSign,
  Pencil,
  Save,
  Send
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
}

interface Pin {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  description: string;
}

interface Pinboard {
  id: string;
  title: string;
  pins: number;
  time: string;
  url: string;
  images: string[];
}

interface ProjectTask {
  id: string;
  item: string;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string;   // ISO Date YYYY-MM-DD
  notes: string;
  taskType: 'Procurement' | 'Design' | 'Construction' | 'Admin' | 'Meeting';
  priority: 'High' | 'Medium' | 'Low';
}

// --- Furniture Schedule Types ---
interface FurnitureSection {
  id: string;
  title: string;
}

interface FurnitureItem {
  id: string;
  sectionId: string;
  name: string;
  width: string;
  length: string;
  height: string;
  depth: string;
  material: string;
  qty: number;
  leadTime: string;
  supplier: string;
  status: 'Draft' | 'Approved' | 'Ordered';
  imageUrl?: string;
  unitCost: string; // Added for financial view hint
}

// --- Block Editor Types ---
type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'ul' | 'ol' | 'image' | 'columns';

interface BlockStyle {
  aspectRatio?: 'auto' | '1/1' | '4/3' | '16/9' | '3/4';
}

interface EditorBlock {
  id: string;
  type: BlockType;
  content: string; // HTML content for text, src for image
  columns?: EditorBlock[]; // For 'columns' type
  style?: BlockStyle;
}

// Drag & Drop Types
type DropPosition = 'top' | 'bottom' | 'left' | 'right' | null;
interface DropTargetState {
  id: string;
  position: DropPosition;
}

// --- AI Layout Types ---
interface LayoutSlide {
  layout: 'Cover' | 'Table_Of_Contents' | 'Section_Header' | 'Split_Left_Text' | 'Split_Right_Text' | 'Full_Grid' | 'Quote_Center' | 'Standard_Text';
  title: string;
  elements: { type: string; content: string }[];
}

const MOCK_ITEMS: ProjectItem[] = [
  {
    id: '1',
    name: 'Presentation',
    type: 'Document',
    sharedWith: [],
    status: '',
    lastUpdated: 'Just now',
    updatedBy: 'LE MAI KHANH'
  },
  {
    id: '2',
    name: 'Project Management',
    type: 'Board',
    sharedWith: [],
    status: '',
    lastUpdated: '6 months ago',
    updatedBy: 'LE MAI KHANH'
  },
  {
    id: '3',
    name: 'Furniture Schedule',
    type: 'Schedule',
    sharedWith: [],
    status: '',
    lastUpdated: '6 months ago',
    updatedBy: 'LE MAI KHANH'
  }
];

const MOCK_TASKS: ProjectTask[] = [
  {
    id: '1',
    item: 'Client Design Review',
    startDate: '2025-10-24',
    endDate: '2025-10-24',
    notes: 'Review initial moodboards and material selection.',
    taskType: 'Meeting',
    priority: 'High'
  },
  {
    id: '2',
    item: 'Sourcing Marble Samples',
    startDate: '2025-10-25',
    endDate: '2025-10-30',
    notes: 'Contact vendor for Calacatta Gold availability.',
    taskType: 'Procurement',
    priority: 'Medium'
  },
  {
    id: '3',
    item: 'Finalize Floor Plan Level 1',
    startDate: '2025-10-28',
    endDate: '2025-11-05',
    notes: 'Update kitchen layout based on feedback.',
    taskType: 'Design',
    priority: 'High'
  },
  {
    id: '4',
    item: 'Permit Application Submission',
    startDate: '2025-11-01',
    endDate: '2025-11-01',
    notes: 'Submit all technical drawings to the city council.',
    taskType: 'Admin',
    priority: 'Low'
  }
];

const MOCK_FURNITURE_SECTIONS: FurnitureSection[] = [
  { id: 'sec1', title: 'Dining Room' },
  { id: 'sec2', title: 'Living Room' },
  { id: 'sec3', title: 'Master Bedroom' }
];

const MOCK_FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'f1', sectionId: 'sec1', name: 'Dining Chair - Walnut',
    width: '540', length: '560', height: '800', depth: '560',
    material: 'American Walnut Frame / Boucle Fabric Upholstery',
    qty: 8, leadTime: '12-14 Weeks', supplier: 'Living Edge', status: 'Draft',
    unitCost: '1,200', imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'f2', sectionId: 'sec1', name: 'Oval Dining Table',
    width: '2800', length: '1100', height: '740', depth: '1100',
    material: 'Solid Wood / Black Elm Stained Finish',
    qty: 1, leadTime: '16 Weeks', supplier: 'Poliform', status: 'Draft',
    unitCost: '8,500', imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'f3', sectionId: 'sec1', name: 'Feature Pendant Light',
    width: '1500', length: '-', height: '400', depth: '-',
    material: 'Brushed Brass / Hand-blown Glass',
    qty: 1, leadTime: 'In Stock', supplier: 'Euroluce', status: 'Approved',
    unitCost: '3,200', imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'f4', sectionId: 'sec1', name: 'Woven Area Rug',
    width: '3500', length: '2500', height: '15', depth: '-',
    material: 'Wool/Jute Mix - Natural Grey',
    qty: 1, leadTime: '8 Weeks', supplier: 'Armadillo & Co', status: 'Draft',
    unitCost: '2,800', imageUrl: 'https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?w=150&auto=format&fit=crop&q=60'
  }
];

const ARCH_IMAGE_POOL = [
  'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1599696885722-da2655074d28?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1626246430312-d816d7a4253e?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1580261450046-d0a30080dc9b?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=500&auto=format&fit=crop&q=60'
];

const INITIAL_PINBOARDS: Pinboard[] = [
  {
    id: '1',
    title: 'Living Room Inspiration',
    pins: 33,
    time: 'Just now',
    url: 'https://www.pinterest.com/scoutandnimble/living-room/', 
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80', 
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=500&auto=format&fit=crop&q=60', 
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=500&auto=format&fit=crop&q=60' 
    ]
  }
];

// --- Editor Initial Content ---
const INITIAL_BLOCKS: EditorBlock[] = [
  { id: 'b1', type: 'p', content: 'Prepared by: Le Mai Khanh' },
  { id: 'b2', type: 'h2', content: '1. Design Philosophy' },
  { id: 'b3', type: 'p', content: 'The concept revolves around the integration of natural light and sustainable materials. We aim to create a space that feels both expansive and intimate, utilizing open floor plans connected by transitional zones.' },
  { id: 'b4', type: 'p', content: 'Key materials include:' },
  { id: 'b5', type: 'ul', content: 'Polished concrete flooring for thermal mass' },
  { id: 'b6', type: 'ul', content: 'Natural oak timber cladding' },
  { id: 'b7', type: 'ul', content: 'Floor-to-ceiling glazing' },
  { id: 'b8', type: 'blockquote', content: '"Architecture should speak of its time and place, but yearn for timelessness."' },
  { id: 'b9', type: 'h2', content: '2. Spatial Planning' },
  { id: 'b10', type: 'p', content: 'The ground floor is dedicated to communal activities, featuring a seamless flow between the kitchen, dining, and living areas. The upper floor remains private, housing the bedrooms and a dedicated study space.' },
  { id: 'b11', type: 'p', content: '' }, // Trailing empty block
];

// --- Editor Configuration ---
const SLASH_COMMANDS = [
  { label: 'Text', icon: Type, type: 'p', desc: 'Just start writing with plain text.' },
  { label: 'Heading 1', icon: Heading1, type: 'h1', desc: 'Big section heading.' },
  { label: 'Heading 2', icon: Heading2, type: 'h2', desc: 'Medium section heading.' },
  { label: 'Heading 3', icon: Heading3, type: 'h3', desc: 'Small section heading.' },
  { label: 'Bullet List', icon: List, type: 'ul', desc: 'Create a simple bulleted list.' },
  { label: 'Numbered List', icon: ListOrdered, type: 'ol', desc: 'Create a list with numbering.' },
  { label: 'Quote', icon: Quote, type: 'blockquote', desc: 'Capture a quote.' },
];

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  const [projectItems, setProjectItems] = useState<ProjectItem[]>(MOCK_ITEMS);
  
  const activeItem = projectItems.find(i => i.id === activeTab);

  const [pinboards, setPinboards] = useState<Pinboard[]>(INITIAL_PINBOARDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardUrl, setNewBoardUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  
  const [activeBoard, setActiveBoard] = useState<Pinboard | null>(null);
  const [boardPins, setBoardPins] = useState<Pin[]>([]);
  const [isLoadingPins, setIsLoadingPins] = useState(false);

  const [activeSidebarBoard, setActiveSidebarBoard] = useState<Pinboard | null>(null);
  const [sidebarPins, setSidebarPins] = useState<string[]>([]);
  const [isLoadingSidebarPins, setIsLoadingSidebarPins] = useState(false);

  const [tasks, setTasks] = useState<ProjectTask[]>(MOCK_TASKS);
  const [taskViewMode, setTaskViewMode] = useState<'LIST' | 'TIMELINE'>('LIST');

  const [furnitureSections, setFurnitureSections] = useState<FurnitureSection[]>(MOCK_FURNITURE_SECTIONS);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>(MOCK_FURNITURE_ITEMS);

  const [blocks, setBlocks] = useState<EditorBlock[]>(INITIAL_BLOCKS);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState('Concept Presentation: Modern Villa');
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState | null>(null);
  const [isDraggingExternal, setIsDraggingExternal] = useState(false);

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isGeneratingLayout, setIsGeneratingLayout] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<LayoutSlide[] | null>(null);
  const [layoutStyle, setLayoutStyle] = useState('Minimalist & Clean');

  const [isCreateItemModalOpen, setCreateItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'Document' | 'Board' | 'Schedule'>('Document');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState('');

  // AI Image Edit State
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [isAiImageLoading, setIsAiImageLoading] = useState(false);

  const getPinterestInfo = (urlStr: string) => {
    try {
      let cleanUrl = urlStr.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      const url = new URL(cleanUrl);
      if (!url.hostname.includes('pinterest')) return null;
      const pathSegments = url.pathname.split('/').filter(p => p.length > 0);
      if (pathSegments.length >= 2) return { username: pathSegments[0], boardName: pathSegments[1] };
      return null;
    } catch (e) { return null; }
  };

  const fetchRSSContent = async (url: string): Promise<string | null> => {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`;
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        if (data.contents) return data.contents;
      }
    } catch (e) {}
    try {
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
      if (response.ok) return await response.text();
    } catch (e) {}
    return null;
  };

  const parsePinterestRSS = (xmlText: string): Pin[] => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      if (xmlDoc.querySelector("parsererror")) return [];
      const items = xmlDoc.querySelectorAll("item");
      const pins: Pin[] = [];
      items.forEach((item) => {
        const title = item.querySelector("title")?.textContent || "Untitled";
        const link = item.querySelector("link")?.textContent || "";
        const description = item.querySelector("description")?.textContent || "";
        let imageUrl = "";
        let cleanDesc = description;
        if (description) {
           const htmlParser = new DOMParser();
           const htmlDoc = htmlParser.parseFromString(description, "text/html");
           const img = htmlDoc.querySelector("img");
           if (img && img.src) imageUrl = img.src.replace('/236x/', '/564x/');
           cleanDesc = htmlDoc.body.textContent || "";
        }
        if (imageUrl) pins.push({ id: Math.random().toString(36).substr(2, 9), title, link, imageUrl, description: cleanDesc });
      });
      return pins;
    } catch (error) { return []; }
  };

  const fetchBoardData = async (url: string): Promise<Pin[]> => {
     const info = getPinterestInfo(url);
     if (!info) return [];
     const rssUrl = `https://www.pinterest.com/${info.username}/${info.boardName}.rss`;
     const content = await fetchRSSContent(rssUrl);
     if (!content) return [];
     return parsePinterestRSS(content);
  };

  useEffect(() => {
    const loadDemoBoard = async () => {
      const demoBoard = pinboards.find(b => b.id === '1' && b.url);
      if (demoBoard) {
        const isFallbackImage = demoBoard.images[0]?.includes('unsplash.com');
        if (isFallbackImage) {
            const pins = await fetchBoardData(demoBoard.url);
            if (pins.length > 0) {
              const images = pins.map(p => p.imageUrl).slice(0, 3);
              setPinboards(prev => prev.map(board => board.id === '1' ? { ...board, images: images } : board));
            }
        }
      }
    };
    loadDemoBoard();
  }, []);

  useEffect(() => {
    if (activeTab && activeTab !== 'OVERVIEW') {
        const item = projectItems.find(i => i.id === activeTab);
        if (item) {
             if (item.type === 'Document') {
                 setBlocks(INITIAL_BLOCKS); 
                 setDocumentTitle(item.name);
             } else if (item.type === 'Board') {
                 setTasks(MOCK_TASKS);
             } else if (item.type === 'Schedule') {
                 setFurnitureSections(MOCK_FURNITURE_SECTIONS); 
                 setFurnitureItems(MOCK_FURNITURE_ITEMS);
             }
        }
    }
  }, [activeTab, projectItems]);

  const handleAddBoard = async () => {
    if (!newBoardTitle) return;
    setIsFetching(true);
    let boardPins: Pin[] = [];
    if (newBoardUrl) boardPins = await fetchBoardData(newBoardUrl);
    const fetchedImages = boardPins.map(p => p.imageUrl);
    let displayImages = fetchedImages;
    if (!newBoardUrl && fetchedImages.length === 0) {
        const shuffled = [...ARCH_IMAGE_POOL].sort(() => 0.5 - Math.random());
        displayImages = shuffled.slice(0, 3);
    }
    setPinboards([...pinboards, {
      id: Date.now().toString(),
      title: newBoardTitle,
      pins: boardPins.length || 0, 
      time: 'Just now',
      images: displayImages.slice(0, 3),
      url: newBoardUrl
    }]);
    setIsModalOpen(false);
    setNewBoardTitle('');
    setNewBoardUrl('');
    setIsFetching(false);
  };

  const handleBoardClick = async (board: Pinboard) => {
    if (board.url) {
      setActiveBoard(board);
      setIsLoadingPins(true);
      setBoardPins(await fetchBoardData(board.url));
      setIsLoadingPins(false);
    } else {
      setActiveBoard(board);
      setBoardPins([]); 
    }
  };

  const handleSidebarBoardClick = async (board: Pinboard) => {
    setActiveSidebarBoard(board);
    setIsLoadingSidebarPins(true);
    let pins: string[] = board.images;
    if (board.url) {
        try {
            const fetchedPins = await fetchBoardData(board.url);
            if (fetchedPins.length > 0) {
                pins = fetchedPins.map(p => p.imageUrl);
            }
        } catch (e) {
            console.error("Failed to fetch sidebar pins", e);
        }
    }
    setSidebarPins(pins);
    setIsLoadingSidebarPins(false);
  };

  const handleBackToBoards = () => {
    setActiveBoard(null);
  };

  const handleItemClick = (item: ProjectItem) => {
     setActiveTab(item.id);
  };
  
  const handleCreateNewItem = () => {
     if (!newItemName) return;
     const newId = Date.now().toString();
     const newItem: ProjectItem = {
         id: newId,
         name: newItemName,
         type: newItemType as any,
         sharedWith: [],
         status: 'Draft',
         lastUpdated: 'Just now',
         updatedBy: 'LE MAI KHANH'
     };
     setProjectItems([...projectItems, newItem]);
     setCreateItemModalOpen(false);
     setNewItemName('');
     setActiveTab(newId);
  };
  
  const startEditingItem = (e: React.MouseEvent, item: ProjectItem) => {
      e.stopPropagation();
      setEditingItemId(item.id);
      setEditingItemName(item.name);
  };
  
  const saveEditingItem = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (editingItemId) {
          setProjectItems(prev => prev.map(i => i.id === editingItemId ? { ...i, name: editingItemName } : i));
          setEditingItemId(null);
      }
  };
  
  const cancelEditingItem = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingItemId(null);
  }

  const handleAddTask = () => {
    const today = new Date().toISOString().split('T')[0];
    const newTask: ProjectTask = {
      id: Date.now().toString(),
      item: '',
      startDate: today,
      endDate: today,
      notes: '',
      taskType: 'Admin',
      priority: 'Medium'
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (id: string, field: keyof ProjectTask, value: string) => {
    setTasks(prev => prev.map(task => {
        if (task.id === id) {
            if (field === 'startDate' && value > task.endDate) {
                 return { ...task, [field]: value, endDate: value };
            }
            if (field === 'endDate' && value < task.startDate) {
                 return { ...task, [field]: value, startDate: value };
            }
            return { ...task, [field]: value };
        }
        return task;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleAddFurnitureItem = (sectionId: string) => {
    const newItem: FurnitureItem = {
      id: Date.now().toString(),
      sectionId,
      name: 'New Item',
      width: '-', length: '-', height: '-', depth: '-',
      material: '',
      qty: 1, leadTime: 'TBD', supplier: '', status: 'Draft',
      unitCost: '0'
    };
    setFurnitureItems([...furnitureItems, newItem]);
  };

  const handleUpdateFurnitureItem = (id: string, field: keyof FurnitureItem, value: any) => {
    setFurnitureItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleDeleteFurnitureItem = (id: string) => {
    setFurnitureItems(prev => prev.filter(item => item.id !== id));
  };

  const handleGenerateLayout = async () => {
    setIsLayoutModalOpen(true);
    if (!generatedSlides) {
      setIsGeneratingLayout(true);
      const result = await generateSlideLayout(blocks, layoutStyle, documentTitle);
      setGeneratedSlides(result.slides);
      setIsGeneratingLayout(false);
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const enhancedData = await enhanceDocumentContent(blocks);
      if (enhancedData) {
        setBlocks(prev => {
          const updateRecursive = (list: EditorBlock[]): EditorBlock[] => {
            return list.map(b => {
              const match = enhancedData.find((ed: any) => ed.id === b.id);
              if (match) return { ...b, content: match.enhanced_content };
              if (b.columns) return { ...b, columns: updateRecursive(b.columns) };
              return b;
            });
          };
          return updateRecursive(prev);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAiImageEditSubmit = async () => {
    if (!editingImageId || !aiImagePrompt) return;
    
    setIsAiImageLoading(true);
    try {
        const block = findBlockRecursive(blocks, editingImageId);
        if (block) {
            const newImageUrl = await editImageWithAI(block.content, aiImagePrompt);
            if (newImageUrl) {
                updateBlockContent(editingImageId, newImageUrl);
                setEditingImageId(null);
                setAiImagePrompt('');
            }
        }
    } catch (e) {
        console.error("Failed to edit image with AI", e);
    } finally {
        setIsAiImageLoading(false);
    }
  };

  const regenerateLayout = async () => {
      setGeneratedSlides(null);
      setIsGeneratingLayout(true);
      const result = await generateSlideLayout(blocks, layoutStyle, documentTitle);
      setGeneratedSlides(result.slides);
      setIsGeneratingLayout(false);
  };

  const createBlock = (type: BlockType = 'p', content = ''): EditorBlock => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    type,
    content
  });

  const findBlockRecursive = (list: EditorBlock[], id: string): EditorBlock | null => {
    for (const block of list) {
      if (block.id === id) return block;
      if (block.columns) {
        const found = findBlockRecursive(block.columns, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeBlockRecursive = (list: EditorBlock[], id: string): EditorBlock[] => {
    return list.reduce((acc: EditorBlock[], block) => {
      if (block.id === id) {
        return acc;
      }
      if (block.columns) {
        const newColumns = removeBlockRecursive(block.columns, id);
        if (newColumns.length === 0) {
           return acc;
        }
        if (newColumns.length === 1) {
           return [...acc, newColumns[0]];
        }
        return [...acc, { ...block, columns: newColumns }];
      }
      return [...acc, block];
    }, []);
  };

  const insertBlockRecursive = (list: EditorBlock[], targetId: string, blockToInsert: EditorBlock, position: DropPosition): EditorBlock[] => {
    return list.flatMap(block => {
      if (block.id === targetId) {
        if (position === 'top') return [blockToInsert, block];
        if (position === 'bottom') return [block, blockToInsert];
        if (position === 'left') {
           return [{
             id: createBlock().id,
             type: 'columns',
             content: '',
             columns: [blockToInsert, block]
           }];
        }
        if (position === 'right') {
           return [{
             id: createBlock().id,
             type: 'columns',
             content: '',
             columns: [block, blockToInsert]
           }];
        }
      }
      if (block.columns) {
        return [{
          ...block,
          columns: insertBlockRecursive(block.columns, targetId, blockToInsert, position)
        }];
      }
      return [block];
    });
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(prev => {
        const updateRecursive = (list: EditorBlock[]): EditorBlock[] => {
            return list.map(b => {
                if (b.id === id) return { ...b, content };
                if (b.columns) return { ...b, columns: updateRecursive(b.columns) };
                return b;
            });
        };
        return updateRecursive(prev);
    });
  };
  
  const updateBlockStyle = (id: string, styleUpdate: Partial<BlockStyle>) => {
     setBlocks(prev => {
        const updateRecursive = (list: EditorBlock[]): EditorBlock[] => {
            return list.map(b => {
                if (b.id === id) return { ...b, style: { ...b.style, ...styleUpdate } };
                if (b.columns) return { ...b, columns: updateRecursive(b.columns) };
                return b;
            });
        };
        return updateRecursive(prev);
     });
  };

  const handleBlockKeyDown = (e: React.KeyboardEvent, index: number, block: EditorBlock) => {
    if (e.key === '/') {
       const rect = blockRefs.current[block.id]?.getBoundingClientRect();
       if (rect) {
         setSlashMenuPosition({ top: rect.bottom + window.scrollY + 5, left: rect.left + window.scrollX });
         setShowSlashMenu(true);
         setActiveBlockId(block.id);
       }
    } else if (showSlashMenu) {
       if (e.key === 'ArrowUp') {
           e.preventDefault();
           setSlashSelectedIndex(prev => Math.max(0, prev - 1));
       } else if (e.key === 'ArrowDown') {
           e.preventDefault();
           setSlashSelectedIndex(prev => Math.min(SLASH_COMMANDS.length - 1, prev + 1));
       } else if (e.key === 'Enter') {
           e.preventDefault();
           changeBlockType(block.id, SLASH_COMMANDS[slashSelectedIndex].type as BlockType);
           setShowSlashMenu(false);
       } else if (e.key === 'Escape') {
           setShowSlashMenu(false);
       }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlock = createBlock('p');
      setBlocks(prev => insertBlockRecursive(prev, block.id, newBlock, 'bottom'));
      setTimeout(() => {
        blockRefs.current[newBlock.id]?.focus();
        setActiveBlockId(newBlock.id);
      }, 10);
    } else if (e.key === 'Backspace') {
      const textContent = block.content.replace(/<[^>]*>/g, '').trim();
      const isEmpty = !textContent && (!block.content.includes('<img') && !block.content.includes('<iframe'));
      if (isEmpty) {
        e.preventDefault();
        setBlocks(prev => removeBlockRecursive(prev, block.id));
      }
    }
  };

  const changeBlockType = (id: string, type: BlockType) => {
    setBlocks(prev => {
        const updateRecursive = (list: EditorBlock[]): EditorBlock[] => {
            return list.map(b => {
                if (b.id === id) return { ...b, type };
                if (b.columns) return { ...b, columns: updateRecursive(b.columns) };
                return b;
            });
        };
        return updateRecursive(prev);
    });
    setTimeout(() => blockRefs.current[id]?.focus(), 0);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    e.stopPropagation();
    setDraggedBlockId(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImageDragStart = (e: React.DragEvent, imageUrl: string) => {
    e.stopPropagation();
    setDraggedBlockId(null);
    setIsDraggingExternal(true);
    e.dataTransfer.setData('text/plain', imageUrl);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDraggingExternal(false);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedBlockId === targetId) return;
    const targetEl = blockRefs.current[targetId];
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let edgeThreshold = 50;
    const verticalMid = rect.height / 2;
    let pos: DropPosition = null;
    const targetBlock = findBlockRecursive(blocks, targetId);
    const draggedBlock = draggedBlockId ? findBlockRecursive(blocks, draggedBlockId) : null;
    const isTargetImage = targetBlock?.type === 'image';
    const isDraggingImage = (draggedBlock?.type === 'image') || isDraggingExternal;
    if (isTargetImage && isDraggingImage) {
        const horizMidStart = rect.width * 0.2;
        const horizMidEnd = rect.width * 0.8;
        if (x > horizMidStart && x < horizMidEnd) {
             pos = 'right';
        } else if (x <= horizMidStart) {
             pos = 'left';
        } else {
             pos = 'right';
        }
    } else {
        if (x < edgeThreshold) pos = 'left';
        else if (x > rect.width - edgeThreshold) pos = 'right';
        else if (y < verticalMid) pos = 'top';
        else pos = 'bottom';
    }
    setDropTarget({ id: targetId, position: pos });
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingExternal(false);
    if (dropTarget) return;
    const imageUrl = e.dataTransfer.getData('text/plain');
    if (imageUrl) {
        const newBlock = createBlock('image', imageUrl);
        setBlocks(prev => [...prev, newBlock]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingExternal(false);
    const finalTarget = dropTarget;
    setDropTarget(null);
    const imageUrl = e.dataTransfer.getData('text/plain');
    if (imageUrl && !draggedBlockId) {
       if (finalTarget) {
           const newBlock = createBlock('image', imageUrl);
           setBlocks(prev => insertBlockRecursive(prev, finalTarget.id, newBlock, finalTarget.position));
       } else {
           const newBlock = createBlock('image', imageUrl);
           setBlocks(prev => [...prev, newBlock]);
       }
       return;
    }
    if (draggedBlockId && finalTarget) {
        if (draggedBlockId === finalTarget.id) return;
        const blockToMove = findBlockRecursive(blocks, draggedBlockId);
        if (!blockToMove) return;
        let newTree = removeBlockRecursive(blocks, draggedBlockId);
        newTree = insertBlockRecursive(newTree, finalTarget.id, blockToMove, finalTarget.position);
        setBlocks(newTree);
    }
    setDraggedBlockId(null);
  };

  const renderDropIndicator = (blockId: string) => {
    if (dropTarget?.id !== blockId) return null;
    const styleMap = {
      top: 'top-0 left-0 right-0 h-1 bg-black',
      bottom: 'bottom-0 left-0 right-0 h-1 bg-black',
      left: 'top-0 bottom-0 left-0 w-1 bg-black',
      right: 'top-0 bottom-0 right-0 w-1 bg-black'
    };
    if (!dropTarget.position) return null;
    return <div className={`absolute pointer-events-none z-20 ${styleMap[dropTarget.position]}`} />;
  };

  const renderBlock = (block: EditorBlock, index: number, inColumn = false) => {
    const isFocused = activeBlockId === block.id;
    if (block.type === 'columns' && block.columns) {
      return (
        <div 
          key={block.id} 
          className="flex flex-row gap-6 my-2 group/columns animate-fade-in relative min-h-[50px]"
        >
          {block.columns.map((colBlock, cIdx) => (
             <div key={colBlock.id} className="flex-1 min-w-0 relative">
                {renderBlock(colBlock, index, true)}
             </div>
          ))}
        </div>
      );
    }
    if (block.type === 'image') {
       const aspectRatio = block.style?.aspectRatio || 'auto';
       const aspectRatioClass = {
           'auto': '',
           '1/1': 'aspect-square object-cover',
           '4/3': 'aspect-[4/3] object-cover',
           '16/9': 'aspect-video object-cover',
           '3/4': 'aspect-[3/4] object-cover',
       }[aspectRatio];
       const isBeingEditedByAi = editingImageId === block.id;

       return (
         <div 
           key={block.id}
           ref={(el) => { blockRefs.current[block.id] = el; }}
           className={`relative my-4 group/block ${isFocused ? 'ring-2 ring-gray-200 rounded' : ''}`}
           draggable={true}
           onDragStart={(e) => handleDragStart(e, block.id)}
           onDragOver={(e) => handleDragOver(e, block.id)}
           onDrop={handleDrop}
           onClick={() => setActiveBlockId(block.id)}
         >
            {renderDropIndicator(block.id)}
            
            {/* AI Prompt Input Popover */}
            {isBeingEditedByAi && (
                <div className="absolute top-0 right-0 mt-14 mr-3 z-30 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white border border-gray-200 shadow-xl rounded-lg p-3 w-64">
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">AI Visualization Edit</div>
                        <div className="relative">
                            <textarea 
                                autoFocus
                                value={aiImagePrompt}
                                onChange={(e) => setAiImagePrompt(e.target.value)}
                                placeholder="Change sofa to leather, add plants..."
                                className="w-full text-xs bg-gray-50 border border-gray-100 rounded p-2 focus:ring-1 focus:ring-black outline-none resize-none h-20 mb-2"
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingImageId(null)} className="px-2 py-1 text-[10px] font-medium text-gray-400 hover:text-gray-900 transition-colors">Cancel</button>
                                <button 
                                    onClick={handleAiImageEditSubmit} 
                                    disabled={!aiImagePrompt || isAiImageLoading}
                                    className="px-3 py-1 bg-black text-white text-[10px] font-medium rounded hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {isAiImageLoading ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div 
                className={`absolute right-3 top-3 z-20 transition-all duration-200 ${isFocused ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'}`}
                onClick={(e) => e.stopPropagation()} 
            >
               <div className="bg-white text-gray-700 rounded-md flex items-center gap-1 p-1 shadow-sm border border-gray-200 ring-1 ring-black/5">
                  <div className="flex items-center gap-1 px-2 border-r border-gray-100">
                     <button 
                        onClick={() => setEditingImageId(isBeingEditedByAi ? null : block.id)} 
                        className={`p-1.5 rounded-sm transition-colors ${isBeingEditedByAi ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                        title="Edit with AI"
                     >
                        <Sparkles size={14} />
                     </button>
                     <div className="w-px h-4 bg-gray-100 mx-1"></div>
                     <Crop size={14} className="text-gray-400" />
                  </div>
                  <button onClick={() => updateBlockStyle(block.id, { aspectRatio: 'auto' })} className={`p-1.5 rounded-sm hover:bg-gray-100 transition-colors ${aspectRatio === 'auto' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`} title="Original"><Maximize size={14} /></button>
                  <button onClick={() => updateBlockStyle(block.id, { aspectRatio: '1/1' })} className={`p-1.5 rounded-sm hover:bg-gray-100 transition-colors ${aspectRatio === '1/1' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`} title="Square (1:1)"><Square size={14} /></button>
                  <button onClick={() => updateBlockStyle(block.id, { aspectRatio: '4/3' })} className={`p-1.5 rounded-sm hover:bg-gray-100 transition-colors ${aspectRatio === '4/3' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`} title="Standard (4:3)"><RectangleHorizontal size={14} className="scale-y-110"/></button>
                  <button onClick={() => updateBlockStyle(block.id, { aspectRatio: '16/9' })} className={`p-1.5 rounded-sm hover:bg-gray-100 transition-colors ${aspectRatio === '16/9' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`} title="Wide (16:9)"><RectangleHorizontal size={14} className="scale-x-125 scale-y-75"/></button>
               </div>
            </div>
            
            <div 
                className={`absolute left-0 top-0 opacity-0 group-hover/block:opacity-100 cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-700 z-10 ${isFocused ? 'opacity-100' : ''}`}
                onDragStart={(e) => handleDragStart(e, block.id)}
                draggable
            >
                <div className="bg-white border border-gray-200 shadow-sm rounded p-1 flex items-center">
                    <GripVertical size={16} />
                    <button onClick={(e) => { e.stopPropagation(); setBlocks(prev => removeBlockRecursive(prev, block.id)); }} className="p-0.5 hover:text-red-500 transition-colors ml-1"><Trash2 size={14} /> </button>
                </div>
            </div>

            {isAiImageLoading && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center">
                        <Loader2 size={32} className="animate-spin text-black mb-2" />
                        <span className="text-xs font-medium uppercase tracking-widest text-black animate-pulse">Processing Visuals</span>
                    </div>
                </div>
            )}

            <img src={block.content} className={`w-full rounded-lg shadow-sm transition-all duration-300 ${aspectRatioClass}`} alt="Block" />
         </div>
       );
    }
    const contentStyles = {
      h1: 'text-4xl font-extrabold tracking-tight text-gray-900 leading-tight',
      h2: 'text-2xl font-bold tracking-tight text-gray-800 pb-2 border-b border-gray-100',
      h3: 'text-xl font-semibold text-gray-800',
      p: 'text-base text-gray-600 leading-7 min-h-[1.75rem]',
      blockquote: 'border-l-4 border-gray-900 pl-4 py-2 italic text-lg text-gray-700 bg-gray-50 rounded-r-sm',
      ul: 'list-disc list-outside ml-5 leading-7 text-gray-600',
      ol: 'list-decimal list-outside ml-5 leading-7 text-gray-600',
    };
    const wrapperStyles = {
      h1: 'mt-10 mb-4',
      h2: 'mt-8 mb-3',
      h3: 'mt-6 mb-2',
      p: 'my-1',
      blockquote: 'my-4',
      ul: 'my-1',
      ol: 'my-1',
      image: 'my-4',
      columns: 'my-2'
    };
    const blockType = block.type as keyof typeof contentStyles;
    return (
      <div 
        key={block.id} 
        className={`group/block relative -ml-12 pl-12 pr-4 py-1 transition-colors hover:bg-gray-50/50 rounded-md ${wrapperStyles[blockType as keyof typeof wrapperStyles] || 'my-1'}`}
        onDragOver={(e) => handleDragOver(e, block.id)}
        onDrop={handleDrop}
      >
        {renderDropIndicator(block.id)}
        <div 
            className={`absolute left-0 top-1.5 flex items-center opacity-0 group-hover/block:opacity-100 transition-opacity ${isFocused ? 'opacity-100' : ''} z-10`}
            contentEditable={false}
        >
            <div className="flex items-center gap-0.5 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-md px-1 py-0.5">
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-0.5 rounded hover:bg-gray-100" draggable onDragStart={(e) => handleDragStart(e, block.id)}> <GripVertical size={14} /> </div>
                <button onClick={(e) => { e.stopPropagation(); setBlocks(prev => removeBlockRecursive(prev, block.id)); }} className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50" title="Delete block"> <Trash2 size={13} /> </button>
            </div>
        </div>
        <div
          ref={(el) => { blockRefs.current[block.id] = el; }}
          contentEditable
          suppressContentEditableWarning
          className={`w-full outline-none ${contentStyles[blockType] || contentStyles.p} ${block.content === '' ? 'empty:before:content-["Type_/_for_commands"] empty:before:text-gray-300 empty:before:font-light' : ''}`}
          onKeyDown={(e) => handleBlockKeyDown(e, index, block)}
          onFocus={() => setActiveBlockId(block.id)}
          onBlur={(e) => updateBlockContent(block.id, e.currentTarget.innerText)}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      </div>
    );
  };

  const renderSlide = (slide: LayoutSlide, index: number) => {
     const isSplitLeft = slide.layout === 'Split_Left_Text';
     const isSplitRight = slide.layout === 'Split_Right_Text';
     const isFullGrid = slide.layout === 'Full_Grid';
     const isCover = slide.layout === 'Cover';
     const isTOC = slide.layout === 'Table_Of_Contents';
     const isSectionHeader = slide.layout === 'Section_Header';
     const imageElements = slide.elements.filter(e => e.type === 'image');
     const textElements = slide.elements.filter(e => e.type !== 'image');
     return (
       <div key={index} className="w-full aspect-[297/210] bg-white shadow-lg border border-gray-200 p-8 md:p-12 mb-8 relative flex flex-col overflow-hidden">
          {!isCover && ( <div className="absolute bottom-6 right-8 text-xs text-gray-400 font-mono"> {String(index + 1).padStart(2, '0')} </div> )}
          {!isCover && ( <div className="absolute top-6 left-8 text-xs font-bold uppercase tracking-widest text-gray-300"> Mirarch Studio </div> )}
          {isCover ? (
             <div className="flex-1 flex flex-col justify-center items-center text-center relative z-10">
                <div className="w-24 h-24 mb-12 border border-black rounded-full flex items-center justify-center"> <div className="w-3 h-3 bg-black rounded-full"></div> </div>
                <h1 className="text-5xl md:text-6xl font-light tracking-tight text-gray-900 mb-6 uppercase">{slide.title}</h1>
                <div className="h-px w-24 bg-gray-300 mb-6"></div>
                <p className="text-sm tracking-widest text-gray-500 uppercase">Concept Design Presentation</p>
                <div className="absolute bottom-0 w-full text-center pb-2"> <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</p> </div>
             </div>
          ) : isTOC ? (
             <div className="flex-1 flex flex-col pt-16 px-12">
                 <h2 className="text-4xl font-light text-gray-900 mb-16 tracking-tight">Table of Contents</h2>
                 <div className="flex-1 space-y-6">
                    {slide.elements.map((el, i) => (
                       <div key={i} className="flex items-baseline justify-between group border-b border-gray-100 pb-2">
                          <div className="flex items-baseline gap-4"> <span className="text-xs font-mono text-gray-400">0{i + 1}</span> <span className="text-xl text-gray-800 font-light group-hover:pl-2 transition-all duration-300" dangerouslySetInnerHTML={{__html: el.content.replace(/<[^>]*>?/gm, '')}} /> </div>
                          <span className="text-xs font-mono text-gray-300">{(i + 2).toString().padStart(2, '0')}</span>
                       </div>
                    ))}
                 </div>
             </div>
          ) : isSectionHeader ? (
             <div className="flex-1 flex flex-col justify-center px-12 bg-gray-50 -m-12 relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-1/2 h-full opacity-10"> <div className="w-full h-full bg-black transform -skew-x-12"></div> </div>
                 <div className="relative z-10"> <span className="text-sm font-mono text-gray-500 mb-4 block">SECTION</span> {textElements.map((el, i) => ( <div key={i} className="text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-4" dangerouslySetInnerHTML={{__html: el.content}} /> ))} </div>
             </div>
          ) : isFullGrid ? (
             <div className="flex-1 flex flex-col h-full pt-8">
                {slide.title && ( <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100 flex-shrink-0">{slide.title}</h2> )}
                <div className={`flex-1 grid gap-4 md:gap-8 ${imageElements.length === 1 ? 'grid-cols-1' : imageElements.length === 2 ? 'grid-cols-2' : imageElements.length === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
                   {imageElements.map((el, i) => ( <div key={`img-${i}`} className={`relative overflow-hidden rounded-sm bg-gray-100 ${imageElements.length === 3 && i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}> <img src={el.content} className="absolute inset-0 w-full h-full object-cover transition-transform hover:scale-105 duration-700" alt="Slide visual" /> </div> ))}
                   {textElements.length > 0 && ( <div className={`flex flex-col justify-center p-4 bg-gray-50 rounded-sm ${imageElements.length > 2 ? 'col-span-full' : ''}`}> {textElements.map((el, i) => ( <div key={`txt-${i}`} className="text-sm text-gray-600 leading-relaxed mb-2" dangerouslySetInnerHTML={{__html: el.content}} /> ))} </div> )}
                </div>
             </div>
          ) : (
             <div className={`flex-1 grid grid-cols-2 gap-12 items-center ${isSplitRight ? 'direction-rtl' : ''} h-full pt-8`}>
                 <div className={`flex flex-col justify-center h-full overflow-hidden ${isSplitRight ? 'order-2' : 'order-1'}`}>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">{slide.title}</h2>
                    <div className="prose prose-sm prose-gray max-w-none overflow-y-auto pr-2 custom-scrollbar"> {textElements.map((el, i) => ( <div key={i} dangerouslySetInnerHTML={{__html: el.content}} /> ))} </div>
                 </div>
                 <div className={`${isSplitRight ? 'order-1' : 'order-2'} h-full bg-gray-50 rounded-lg overflow-hidden relative`}>
                    {imageElements.length > 0 ? ( <img src={imageElements[0].content} className="absolute inset-0 w-full h-full object-cover" alt="Slide visual" /> ) : ( <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100"> <ImageIcon size={48} strokeWidth={1} /> </div> )}
                 </div>
             </div>
          )}
       </div>
     );
  };

  if (activeBoard) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col gap-4">
           <button onClick={handleBackToBoards} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors self-start"> <ChevronLeft size={16} /> Back to Boards </button>
           <div className="flex items-end justify-between border-b border-gray-100 pb-4">
             <div>
               <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{activeBoard.title}</h2>
               <div className="flex items-center gap-2 mt-1"> <p className="text-sm text-gray-500">{boardPins.length} Pins</p> {activeBoard.url && ( <a href={activeBoard.url} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-1"> <ExternalLink size={10} /> View on Pinterest </a> )} </div>
             </div>
           </div>
        </div>
        {isLoadingPins ? ( <div className="h-64 flex flex-col items-center justify-center text-gray-400"> <Loader2 size={32} className="animate-spin mb-2" /> <p className="text-sm">Fetching pins from Pinterest...</p> </div> ) : ( <div className="min-h-[200px]"> {boardPins.length > 0 ? ( <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"> {boardPins.map((pin) => ( <div key={pin.id} className="break-inside-avoid group relative"> <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-2"> <img src={pin.imageUrl} alt={pin.title} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /> </div> </div> ))} </div> ) : ( <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200"> <AlertCircle className="text-gray-300 mb-4" size={48} strokeWidth={1} /> <h3 className="text-gray-900 font-medium mb-1">No Pins Found</h3> </div> )} </div> )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 relative h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-1 flex-shrink-0">
        <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1 max-w-full">
           <button onClick={() => setActiveTab('OVERVIEW')} className={`flex items-center gap-2 px-4 py-2 border rounded-t-md text-sm font-medium border-b-0 relative top-[1px] transition-colors whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'bg-white border-gray-200 text-gray-900 z-10' : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-900'}`}> <LayoutDashboard size={16} /> Overview </button>
           {projectItems.map((item) => ( <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 px-4 py-2 border rounded-t-md text-sm font-medium border-b-0 relative top-[1px] transition-colors whitespace-nowrap ${activeTab === item.id ? 'bg-white border-gray-200 text-gray-900 z-10' : 'bg-gray-50 border-transparent text-gray-500 hover:text-gray-900'}`}> {item.type === 'Schedule' && <Layers size={16} strokeWidth={1.5} />} {item.type === 'Board' && <SquareKanban size={16} strokeWidth={1.5} />} {item.type === 'Pinboard' && <LayoutTemplate size={16} strokeWidth={1.5} />} {item.type === 'Document' && <FileText size={16} strokeWidth={1.5} />} {item.name} </button> ))}
        </div>
        <div className="flex items-center gap-2 mb-2 md:mb-0">
           <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"> View Clients <span className="bg-gray-100 px-1.5 rounded text-gray-900 border border-gray-200">0</span> </button>
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"> <SlidersHorizontal size={14} /> Filters </button>
           <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"> <ArrowUpDown size={14} /> Sort </button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {pinboards.map((board) => (
              <div key={board.id} className="group cursor-pointer" onClick={() => handleBoardClick(board)}>
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-3 grid grid-cols-3 grid-rows-2 gap-0.5 relative hover:opacity-90 transition-opacity border border-gray-100">
                  {board.images.length >= 3 ? ( <> <div className="col-span-2 row-span-2"><img src={board.images[0]} className="w-full h-full object-cover" alt={board.title} /></div> <div className="col-span-1 row-span-1"><img src={board.images[1]} className="w-full h-full object-cover" alt="" /></div> <div className="col-span-1 row-span-1"><img src={board.images[2]} className="w-full h-full object-cover" alt="" /></div> </> ) : board.images.length === 2 ? ( <> <div className="col-span-2 row-span-2"><img src={board.images[0]} className="w-full h-full object-cover" alt={board.title} /></div> <div className="col-span-1 row-span-2"><img src={board.images[1]} className="w-full h-full object-cover" alt="" /></div> </> ) : board.images.length === 1 ? ( <div className="col-span-3 row-span-2"><img src={board.images[0]} className="w-full h-full object-cover" alt={board.title} /></div> ) : (<div className="col-span-3 row-span-2 flex items-center justify-center bg-gray-50"><LayoutTemplate size={32} className="text-gray-300"/></div>)}
                </div>
                <div><h3 className="font-bold text-gray-900 text-base">{board.title}</h3><p className="text-xs text-gray-500">{board.pins} Pins</p></div>
              </div>
            ))}
             <button onClick={() => setIsModalOpen(true)} className="group flex flex-col items-center justify-center aspect-[4/3] rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-100 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3"><Plus className="text-gray-400" size={24} /></div><span className="text-base font-medium text-gray-500">Add Pinboard</span>
            </button>
          </div>
          <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex justify-end"> <button onClick={() => setCreateItemModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors shadow-sm"> <Plus size={14} /> New Item </button> </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="px-6 py-4 font-semibold text-gray-400 text-[10px] uppercase tracking-wider w-1/3">Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-400 text-[10px] uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 font-semibold text-gray-400 text-[10px] uppercase tracking-wider">Shared With</th>
                    <th className="px-6 py-4 font-semibold text-gray-400 text-[10px] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-400 text-[10px] uppercase tracking-wider text-right">Last Updated</th>
                    <th className="px-4 py-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {projectItems.map((item) => (
                    <tr key={item.id} onClick={() => handleItemClick(item)} className="hover:bg-gray-50 transition-colors group cursor-pointer h-16">
                      <td className="px-6 py-3"> <div className="flex items-center gap-4"> <div className="text-gray-900"> {item.type === 'Schedule' && <Layers size={18} strokeWidth={1.5} />} {item.type === 'Board' && <SquareKanban size={18} strokeWidth={1.5} />} {item.type === 'Pinboard' && <LayoutTemplate size={18} strokeWidth={1.5} />} {item.type === 'Document' && <FileText size={18} strokeWidth={1.5} />} </div> {editingItemId === item.id ? ( <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}> <input type="text" value={editingItemName} onChange={(e) => setEditingItemName(e.target.value)} className="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-black outline-none" autoFocus /> <button onClick={saveEditingItem} className="p-1 text-gray-900 hover:bg-gray-100 rounded"><Save size={14}/></button> <button onClick={cancelEditingItem} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={14}/></button> </div> ) : ( <div className="flex items-center gap-2 group/name"> <span className="font-medium text-gray-900 text-sm">{item.name}</span> <button onClick={(e) => startEditingItem(e, item)} className="opacity-0 group-hover/name:opacity-100 p-1 text-gray-400 hover:text-black transition-opacity" > <Pencil size={12} /> </button> </div> )} </div> </td>
                      <td className="px-6 py-3 text-gray-500 text-sm">{item.type === 'Board' ? 'Timeline' : item.type === 'Schedule' ? 'Quotation' : item.type === 'Document' ? 'Presentation' : item.type}</td>
                      <td className="px-6 py-3 text-gray-500 text-sm">{item.sharedWith.length > 0 ? item.sharedWith.join(', ') : '-'}</td>
                      <td className="px-6 py-3 text-gray-500 text-sm">{item.status || '-'}</td>
                      <td className="px-6 py-3 text-right text-gray-500 text-xs"> {item.lastUpdated} <span className="text-gray-400">by</span> {item.updatedBy} </td>
                      <td className="px-4 py-3 text-right"> <button className="text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"> <MoreHorizontal size={16} /> </button> </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {projectItems.length === 0 && ( <div className="p-12 text-center text-gray-400 font-light"> No items in this project yet. </div> )}
          </div>
        </div>
      )}

      {activeItem?.type === 'Schedule' && (
        <div className="animate-fade-in flex flex-col h-full bg-white">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                   <h2 className="text-lg font-bold text-gray-900">Furniture Schedule</h2>
                   <div className="bg-gray-100 p-0.5 rounded-lg flex items-center gap-1"> <button className="px-3 py-1.5 text-xs font-medium bg-white shadow-sm rounded-md text-gray-900">Summary</button> <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">Financial</button> </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative mr-2"> <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> <input type="text" placeholder="Search..." className="pl-8 pr-4 py-1.5 bg-white border border-gray-200 rounded-md text-xs outline-none focus:ring-1 focus:ring-black transition-all w-48 text-gray-900" /> </div>
                    <button className="px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-md text-xs font-medium text-gray-700 flex items-center gap-2 transition-colors"> <Filter size={14} /> Filter </button>
                    <button className="px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-md text-xs font-medium text-gray-700 flex items-center gap-2 transition-colors"> <Download size={14} /> Export </button>
                </div>
            </div>
            <div className="grid grid-cols-12 bg-gray-50/80 backdrop-blur-sm border-y border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-20 shadow-sm">
                <div className="col-span-1 border-r border-gray-200 p-3 flex items-center justify-center">Image</div>
                <div className="col-span-3 border-r border-gray-200 p-3 flex items-center">Product Name</div>
                <div className="col-span-3 border-r border-gray-200 p-3 flex items-center justify-center"> <div className="grid grid-cols-4 w-full text-center"> <div>W</div><div>L</div><div>H</div><div>D</div> </div> </div>
                <div className="col-span-2 border-r border-gray-200 p-3 flex items-center">Material / Finishes</div>
                <div className="col-span-1 border-r border-gray-200 p-3 flex items-center">Qty / Lead</div>
                <div className="col-span-1 border-r border-gray-200 p-3 flex items-center">Supplier</div>
                <div className="col-span-1 p-3 flex items-center justify-end">Actions</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                {furnitureSections.map(section => (
                    <div key={section.id} className="mb-8">
                        <div className="flex items-center gap-3 px-4 py-4 mt-6 border-b border-gray-100 bg-white sticky top-[41px] z-10"> <h3 className="font-bold text-gray-900 text-sm tracking-tight">{section.title}</h3> <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-medium"> {furnitureItems.filter(i => i.sectionId === section.id).length} Items </span> </div>
                        <div className="">
                           {furnitureItems.filter(i => i.sectionId === section.id).map(item => (
                               <div key={item.id} className="group grid grid-cols-12 border-b border-gray-100 hover:bg-gray-50 transition-colors relative min-h-[72px]">
                                   <div className="col-span-1 border-r border-gray-100 p-3 flex items-center justify-center"> <div className="aspect-square bg-white rounded-md overflow-hidden border border-gray-200 relative group/image cursor-pointer shadow-sm hover:shadow-md transition-all w-full max-w-[60px]"> {item.imageUrl ? ( <img src={item.imageUrl} className="w-full h-full object-cover" alt="Item" /> ) : ( <div className="w-full h-full flex items-center justify-center text-gray-300"> <ImageIcon size={20} strokeWidth={1.5} /> </div> )} <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center"> <div className="bg-white p-1 rounded-full shadow-sm"><Plus size={12} /></div> </div> </div> </div>
                                   <div className="col-span-3 border-r border-gray-100 p-3 flex items-center"> <input type="text" value={item.name} onChange={(e) => handleUpdateFurnitureItem(item.id, 'name', e.target.value)} className="w-full text-sm font-semibold text-gray-900 bg-white border border-transparent focus:border-gray-200 focus:ring-1 focus:ring-black rounded px-2 py-1.5 transition-all placeholder:text-gray-300" placeholder="Item Name" /> </div>
                                   <div className="col-span-3 border-r border-gray-100 p-3 flex items-center"> <div className="grid grid-cols-4 gap-2 w-full"> {['width', 'length', 'height', 'depth'].map(dim => ( <div key={dim} className="flex flex-col justify-center"> <input type="text" value={(item as any)[dim]} onChange={(e) => handleUpdateFurnitureItem(item.id, dim as any, e.target.value)} className="w-full text-xs text-gray-600 bg-white border border-transparent focus:border-gray-200 focus:ring-1 focus:ring-black rounded px-1 py-1 transition-all text-center placeholder:text-gray-200" placeholder="-" /> </div> ))} </div> </div>
                                   <div className="col-span-2 border-r border-gray-100 p-3 flex items-center"> <textarea rows={1} value={item.material} onChange={(e) => handleUpdateFurnitureItem(item.id, 'material', e.target.value)} className="w-full text-xs text-gray-600 bg-white border border-transparent focus:border-gray-200 focus:ring-1 focus:ring-black rounded px-2 py-1.5 transition-all resize-none overflow-hidden placeholder:text-gray-300" placeholder="Material specs..." style={{ minHeight: '32px' }} /> </div>
                                   <div className="col-span-1 border-r border-gray-100 p-3 flex flex-col justify-center space-y-1"> <div className="flex items-center justify-between"> <span className="text-[9px] text-gray-400">Qty</span> <input type="number" value={item.qty} onChange={(e) => handleUpdateFurnitureItem(item.id, 'qty', parseInt(e.target.value) || 0)} className="w-10 text-center text-xs text-gray-900 font-medium bg-white border border-transparent focus:border-gray-200 focus:ring-1 focus:ring-black rounded px-1 py-0.5" /> </div> <div className="flex items-center justify-between"> <span className="text-[9px] text-gray-400">Lead</span> <input type="text" value={item.leadTime} onChange={(e) => handleUpdateFurnitureItem(item.id, 'leadTime', e.target.value)} className="w-14 text-right text-[10px] text-gray-600 bg-white border border-transparent focus:border-gray-200 focus:ring-1 focus:ring-black rounded px-1 py-0.5" placeholder="-" /> </div> </div>
                                   <div className="col-span-1 border-r border-gray-100 p-3 flex items-center"> <input type="text" value={item.supplier} onChange={(e) => handleUpdateFurnitureItem(item.id, 'supplier', e.target.value)} className="w-full text-xs font-medium text-gray-900 bg-white border border-transparent focus:border-gray-200 focus:ring-1 focus:ring-black rounded px-2 py-1.5 transition-all cursor-pointer hover:underline decoration-gray-300 placeholder:text-gray-300" placeholder="Select..." /> </div>
                                   <div className="col-span-1 p-3 flex items-center justify-end flex-col gap-2"> <div className="relative group/dropdown"> <button className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-medium transition-colors ${item.status === 'Approved' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 shadow-sm'}`}> {item.status} <ChevronDown size={10} /> </button> </div> <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"> <button onClick={() => handleDeleteFurnitureItem(item.id)} className="text-[10px] hover:bg-gray-100 hover:text-black border border-transparent px-1.5 py-1 rounded text-gray-400 transition-colors"><Trash2 size={12} /></button> </div> </div>
                               </div>
                           ))}
                           <div onClick={() => handleAddFurnitureItem(section.id)} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-center gap-2 group/add border-b border-gray-50" > <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-gray-300 text-xs font-medium text-gray-400 group-hover/add:text-gray-900 group-hover/add:border-gray-400 transition-all bg-white hover:shadow-sm"> <Plus size={14} /> Add Product to {section.title} </div> </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {activeItem?.type === 'Document' && (
        <div className="flex h-full animate-fade-in relative">
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
               <div className="h-14 border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 bg-white z-10">
                  <input type="text" value={documentTitle} onChange={(e) => setDocumentTitle(e.target.value)} className="text-lg font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-300 w-full" placeholder="Presentation Title" />
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className={`flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded text-xs font-medium transition-all ${isEnhancing ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-700 hover:border-black hover:text-black shadow-sm'}`}
                        title="Enhance architectural copy"
                      >
                         {isEnhancing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-gray-900" />}
                         {isEnhancing ? 'Enhancing...' : 'Enhance Content'}
                      </button>
                      <button onClick={handleGenerateLayout} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors" > <Sparkles size={14} /> Generate Layout </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-100"> <Download size={16} /> </button>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-8" onClick={() => {}}>
                  <div className="max-w-3xl mx-auto min-h-[500px] pb-40" onDragOver={handleContainerDragOver} onDrop={handleContainerDrop} > {blocks.map((block, index) => renderBlock(block, index))} <div className="h-32 -mx-12 cursor-text" onClick={(e) => { if (e.target === e.currentTarget) { const newBlock = createBlock('p'); setBlocks(prev => [...prev, newBlock]); setTimeout(() => { blockRefs.current[newBlock.id]?.focus(); setActiveBlockId(newBlock.id); }, 10); } }} /> </div>
               </div>
               {showSlashMenu && ( <div className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-64 overflow-hidden animate-in fade-in zoom-in-95 duration-100" style={{ top: slashMenuPosition.top, left: slashMenuPosition.left }} > <div className="p-1.5"> <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">Basic Blocks</div> {SLASH_COMMANDS.map((cmd, i) => ( <button key={cmd.label} className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md text-left transition-colors ${i === slashSelectedIndex ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => { if (activeBlockId) { changeBlockType(activeBlockId, cmd.type as BlockType); setShowSlashMenu(false); } }} onMouseEnter={() => setSlashSelectedIndex(i)} > <div className="p-1 bg-white border border-gray-200 rounded shadow-sm"> <cmd.icon size={14} /> </div> <div> <div className="font-medium">{cmd.label}</div> <div className="text-[10px] text-gray-400">{cmd.desc}</div> </div> </button> ))} </div> </div> )}
            </div>
            <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 h-full">
                <div className="p-4 border-b border-gray-200 bg-white"> <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2"> <ImageIcon size={16} /> Asset Library </h3> </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar"> {activeSidebarBoard ? ( <div className="space-y-4 animate-fade-in"> <button onClick={() => setActiveSidebarBoard(null)} className="text-xs text-gray-500 hover:text-black flex items-center gap-1 mb-2"> <ChevronLeft size={12} /> Back to Boards </button> <h4 className="font-medium text-sm text-gray-900 mb-3">{activeSidebarBoard.title}</h4> {isLoadingSidebarPins ? ( <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" /></div> ) : ( <div className="grid grid-cols-2 gap-2"> {sidebarPins.map((img, idx) => ( <div key={idx} className="aspect-square rounded overflow-hidden bg-gray-200 cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity" draggable onDragStart={(e) => handleImageDragStart(e, img)} > <img src={img} className="w-full h-full object-cover" alt="Asset" /> </div> ))} </div> )} </div> ) : ( <div className="space-y-4"> {pinboards.map(board => ( <div key={board.id} onClick={() => handleSidebarBoardClick(board)} className="bg-white p-3 rounded border border-gray-200 hover:border-gray-300 cursor-pointer transition-all shadow-sm group" > <div className="flex items-center gap-3 mb-2"> <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden"> {board.images[0] && <img src={board.images[0]} className="w-full h-full object-cover" alt="" />} </div> <div> <div className="text-sm font-medium text-gray-900 group-hover:text-black transition-colors">{board.title}</div> <div className="text-[10px] text-gray-500">{board.pins} Pins</div> </div> </div> </div> ))} </div> )} </div>
            </div>
            {isLayoutModalOpen && ( <div className="absolute inset-0 z-50 bg-gray-100 flex flex-col animate-in slide-in-from-bottom-10 duration-300"> <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm"> <div className="flex items-center gap-4"> <button onClick={() => setIsLayoutModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button> <h2 className="text-lg font-bold text-gray-900">Generated Layout Preview</h2> </div> <div className="flex items-center gap-4"> <select value={layoutStyle} onChange={(e) => setLayoutStyle(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-black" > <option>Minimalist & Clean</option> <option>Bold & Editorial</option> <option>Swiss Grid System</option> </select> <button onClick={regenerateLayout} disabled={isGeneratingLayout} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 flex items-center gap-2" > {isGeneratingLayout ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Regenerate </button> <button className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 shadow-sm flex items-center gap-2"> <Download size={16} /> Export PDF </button> </div> </div> <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-100/50"> {isGeneratingLayout ? ( <div className="h-full flex flex-col items-center justify-center text-gray-400"> <Loader2 size={48} className="animate-spin mb-4 text-black" /> <p className="text-lg font-medium text-gray-900">Designing your slides...</p> <p className="text-sm">Analyzing content structure and visual assets</p> </div> ) : generatedSlides ? ( <div className="max-w-5xl mx-auto space-y-12"> {generatedSlides.map((slide, idx) => renderSlide(slide, idx))} </div> ) : null} </div> </div> )}
        </div>
      )}

      {activeItem?.type === 'Board' && (
        <div className="animate-fade-in flex flex-col h-full overflow-hidden">
           <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div className="flex items-center gap-4">
                  <h2 className="text-lg font-bold text-gray-900">Task Database</h2>
                  <div className="bg-gray-100 p-0.5 rounded-lg flex items-center gap-1"> <button onClick={() => setTaskViewMode('LIST')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${taskViewMode === 'LIST' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`} > <TableIcon size={14} /> List </button> <button onClick={() => setTaskViewMode('TIMELINE')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${taskViewMode === 'TIMELINE' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`} > <GanttChartSquare size={14} /> Timeline </button> </div>
              </div>
              <button onClick={handleAddTask} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm" > <Plus size={16} /> Add Task </button>
           </div>
           <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
              {taskViewMode === 'LIST' ? (
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead> <tr className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-20"> <th className="px-6 py-4 w-1/4 border-r border-gray-200 last:border-r-0">Item</th> <th className="px-6 py-4 w-1/5 border-r border-gray-200 last:border-r-0">Timeline</th> <th className="px-6 py-4 w-1/3 border-r border-gray-200 last:border-r-0">Notes</th> <th className="px-6 py-4 w-1/6 border-r border-gray-200 last:border-r-0">Task Type</th> <th className="px-6 py-4 w-1/6 border-r border-gray-200 last:border-r-0">Priority</th> <th className="px-4 py-4 w-10"></th> </tr> </thead>
                        <tbody className="divide-y divide-gray-100">
                        {tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors group min-h-[56px]">
                                <td className="px-6 py-3 font-medium text-gray-900 relative border-r border-gray-100 last:border-r-0"> <input type="text" value={task.item} onChange={(e) => handleUpdateTask(task.id, 'item', e.target.value)} placeholder="Task Name" className="w-full bg-white border border-transparent focus:border-gray-200 focus:ring-1 focus:ring-black rounded px-2 py-1.5 transition-all outline-none" /> </td>
                                <td className="px-6 py-3 text-gray-500 border-r border-gray-100 last:border-r-0"> <div className="flex items-center gap-2 relative group/date cursor-pointer"> <div className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 transition-colors relative z-0 w-full"> <CalendarDays size={14} className="text-gray-500" /> <span className="text-xs font-medium text-gray-700 whitespace-nowrap"> {new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {' '}&rarr;{' '} {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} </span> <div className="absolute inset-0 opacity-0 flex z-10"> <input type="date" value={task.startDate} onChange={(e) => handleUpdateTask(task.id, 'startDate', e.target.value)} className="flex-1 cursor-pointer h-full w-full" /> <input type="date" value={task.endDate} onChange={(e) => handleUpdateTask(task.id, 'endDate', e.target.value)} className="flex-1 cursor-pointer h-full w-full" /> </div> </div> </div> </td>
                                <td className="px-6 py-3 text-gray-600 border-r border-gray-100 last:border-r-0"> <input type="text" value={task.notes} onChange={(e) => handleUpdateTask(task.id, 'notes', e.target.value)} placeholder="Add notes..." className="w-full bg-white border border-transparent focus:border-gray-200 focus:ring-1 focus:ring-black rounded px-2 py-1.5 transition-all outline-none text-gray-600 truncate" /> </td>
                                <td className="px-6 py-3 border-r border-gray-100 last:border-r-0"> <div className="relative"> <select value={task.taskType} onChange={(e) => handleUpdateTask(task.id, 'taskType', e.target.value)} className="appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black w-auto hover:bg-gray-200 transition-colors" > <option value="Admin">Admin</option> <option value="Design">Design</option> <option value="Construction">Construction</option> <option value="Procurement">Procurement</option> <option value="Meeting">Meeting</option> </select> <ChevronDown size={12} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" /> </div> </td>
                                <td className="px-6 py-3 border-r border-gray-100 last:border-r-0"> <div className="relative"> <select value={task.priority} onChange={(e) => handleUpdateTask(task.id, 'priority', e.target.value)} className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black ${ task.priority === 'High' ? 'bg-black text-white border border-black' : task.priority === 'Medium' ? 'bg-gray-200 text-gray-900 border border-gray-300' : 'bg-white text-gray-500 border border-gray-200' }`} > <option value="High">High</option> <option value="Medium">Medium</option> <option value="Low">Low</option> </select> <ChevronDown size={12} className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${task.priority === 'High' ? 'text-white' : 'text-gray-500'}`} /> </div> </td>
                                <td className="px-4 py-3 text-right"> <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"> <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-colors" title="Delete Task" > <Trash2 size={14} /> </button> <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"> <MoreHorizontal size={14} /> </button> </div> </td>
                            </tr>
                        ))}
                        <tr onClick={handleAddTask} className="hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-50" > <td colSpan={6} className="px-6 py-3"> <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-gray-300 text-xs font-medium text-gray-400 group-hover:text-gray-900 group-hover:border-gray-400 transition-all bg-white hover:shadow-sm w-fit"> <Plus size={14} /> New Task </div> </td> </tr>
                        </tbody>
                    </table>
                </div>
              ) : (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-gray-50/50"> <div className="w-64 flex-shrink-0 border-r border-gray-200 p-4 font-semibold text-xs uppercase tracking-wider text-gray-500 bg-white sticky left-0 z-10"> Task Name </div> <div className="flex-1 overflow-x-auto custom-scrollbar flex"> {Array.from({length: 30}).map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return ( <div key={i} className="flex-shrink-0 w-12 border-r border-gray-100 text-center py-2"> <div className="text-[10px] text-gray-400 uppercase">{d.toLocaleDateString('en-US', {month: 'short'})}</div> <div className="text-xs font-medium text-gray-700">{d.getDate()}</div> </div> ) })} </div> </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                        {tasks.map(task => {
                             const today = new Date();
                             today.setHours(0,0,0,0);
                             const start = new Date(task.startDate);
                             const end = new Date(task.endDate);
                             const diffTimeStart = start.getTime() - today.getTime();
                             const diffDaysStart = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24));
                             const diffTimeDuration = end.getTime() - start.getTime();
                             const durationDays = Math.max(1, Math.ceil(diffTimeDuration / (1000 * 60 * 60 * 24)) + 1);
                             const colWidth = 48; 
                             const leftOffset = diffDaysStart * colWidth;
                             const width = durationDays * colWidth;
                             const priorityColor = task.priority === 'High' ? 'bg-black text-white border-black' : task.priority === 'Medium' ? 'bg-gray-400 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-800';
                             return (
                                <div key={task.id} className="flex border-b border-gray-50 hover:bg-gray-50/50 transition-colors h-12"> <div className="w-64 flex-shrink-0 border-r border-gray-200 px-4 py-2 flex items-center justify-between bg-white sticky left-0 z-10"> <span className="text-sm font-medium text-gray-900 truncate">{task.item}</span> <span className="text-[10px] text-gray-400 border border-gray-100 rounded px-1">{task.priority}</span> </div> <div className="flex-1 relative min-w-0"> <div className="absolute inset-0 flex pointer-events-none"> {Array.from({length: 30}).map((_, i) => ( <div key={i} className="flex-shrink-0 w-12 border-r border-gray-100 h-full"></div> ))} </div> <div className={`absolute top-2.5 h-7 rounded border shadow-sm flex items-center px-2 text-xs whitespace-nowrap overflow-hidden ${priorityColor}`} style={{ left: `${Math.max(0, leftOffset)}px`, width: `${width}px`, minWidth: '24px' }} title={`${task.startDate} - ${task.endDate}`} > {width > 40 && task.taskType} </div> </div> </div>
                             )
                        })}
                    </div>
                </div>
              )}
           </div>
        </div>
      )}

      {isCreateItemModalOpen && ( <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"> <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative"> <button onClick={() => setCreateItemModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button> <h3 className="text-lg font-bold text-gray-900 mb-6">Create New Tab</h3> <div className="space-y-4"> <div> <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Name</label> <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" placeholder="e.g. Master Plan" /> </div> <div> <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type</label> <div className="space-y-2"> <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${newItemType === 'Document' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}> <input type="radio" name="itemType" checked={newItemType === 'Document'} onChange={() => setNewItemType('Document')} className="hidden" /> <FileText size={16} className={newItemType === 'Document' ? 'text-black' : 'text-gray-400'} /> <span className="text-sm font-medium">Presentation (Document)</span> </label> <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${newItemType === 'Board' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}> <input type="radio" name="itemType" checked={newItemType === 'Board'} onChange={() => setNewItemType('Board')} className="hidden" /> <SquareKanban size={16} className={newItemType === 'Board' ? 'text-black' : 'text-gray-400'} /> <span className="text-sm font-medium">Project Management (Timeline)</span> </label> <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${newItemType === 'Schedule' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}> <input type="radio" name="itemType" checked={newItemType === 'Schedule'} onChange={() => setNewItemType('Schedule')} className="hidden" /> <Layers size={16} className={newItemType === 'Schedule' ? 'text-black' : 'text-gray-400'} /> <span className="text-sm font-medium">Furniture Schedule (Quotation)</span> </label> </div> </div> </div> <div className="flex justify-end gap-3 mt-8"> <button onClick={() => setCreateItemModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button> <button onClick={handleCreateNewItem} disabled={!newItemName} className="px-4 py-2 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50">Create</button> </div> </div> </div> )}
      {isModalOpen && ( <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"> <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"> <button onClick={() => !isFetching && setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button> <h3 className="text-lg font-bold text-gray-900 mb-6">Add Pinterest Board</h3> <div className="space-y-4"> <input type="text" value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} placeholder="Board Name" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" /> <input type="text" value={newBoardUrl} onChange={(e) => setNewBoardUrl(e.target.value)} placeholder="Pinterest URL" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none bg-white" /> </div> <div className="flex justify-end gap-3 mt-8"> <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600">Cancel</button> <button onClick={handleAddBoard} disabled={!newBoardTitle || isFetching} className="px-4 py-2 text-sm font-medium bg-black text-white rounded hover:bg-gray-800 flex items-center">{isFetching ? <Loader2 size={16} className="animate-spin mr-2"/> : null} Add Board</button> </div> </div> </div> )}
    </div>
  );
};

export default ProjectDetail;
