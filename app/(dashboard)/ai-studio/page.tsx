import { Sparkles } from 'lucide-react'

export default function AIStudioPage() {
  const features = [
    { title: 'Concept Writer', desc: 'Generate design concept narrative from brief.' },
    { title: 'Moodboard Generator', desc: 'Create moodboard from style keywords.' },
    { title: 'Virtual Staging', desc: 'Place furniture into empty room photos (Gemini 2.5 Flash Image).' },
    { title: 'Material Swap', desc: 'Swap floor, wall, or material in photos.' },
    { title: 'Schedule Generator', desc: 'Auto-draft project schedule from scope.' },
    { title: 'Spec Autofill', desc: 'Fill FF&E rows from product photos.' },
  ]
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">AI Studio</h1>
      <p className="text-sm text-gray-500 mb-8">Generate concepts, moodboards, and specs with AI.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-white border border-gray-100 rounded-sm p-6">
            <Sparkles className="w-5 h-5 text-gray-900 mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-xs text-gray-500 mb-4">{f.desc}</p>
            <button className="text-xs text-gray-400 cursor-not-allowed" disabled>
              Needs GEMINI_API_KEY
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-6">
        Add <code className="bg-gray-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> to Vercel env to enable.
      </p>
    </div>
  )
}
