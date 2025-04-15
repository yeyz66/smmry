import Header from "@/components/layout/Header";
import { Search, Eye, Download, Trash2 } from "lucide-react";

export default function HistoryPage() {
  return (
    <main>
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold">Summarization History</h1>
            
            <div className="flex items-center bg-gray-100 rounded-md px-3 w-64">
              <Search className="w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-transparent border-none py-2 px-2 focus:outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Word Count</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Sample history items */}
                <HistoryItem 
                  title="Introduction to Artificial Intelligence" 
                  date="May 15, 2023" 
                  originalLength="1,200" 
                  summaryLength="300"
                />
                <HistoryItem 
                  title="The Impact of Climate Change on Global Agriculture" 
                  date="May 12, 2023" 
                  originalLength="2,500" 
                  summaryLength="625"
                />
                <HistoryItem 
                  title="Quantum Computing: Current Progress and Future Prospects" 
                  date="May 10, 2023" 
                  originalLength="1,800" 
                  summaryLength="450"
                />
                <HistoryItem 
                  title="The History of the Internet" 
                  date="May 5, 2023" 
                  originalLength="3,000" 
                  summaryLength="750"
                />
                <HistoryItem 
                  title="Understanding Blockchain Technology" 
                  date="May 1, 2023" 
                  originalLength="2,100" 
                  summaryLength="525"
                />
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center py-4 border-t border-gray-200">
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-500 text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50">4</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50">5</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function HistoryItem({ 
  title, 
  date, 
  originalLength, 
  summaryLength 
}: { 
  title: string;
  date: string;
  originalLength: string;
  summaryLength: string;
}) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4 max-w-xs truncate">{title}</td>
      <td className="py-3 px-4 text-gray-500 text-sm">{date}</td>
      <td className="py-3 px-4 text-sm">
        <span>{originalLength} words</span>
        <span className="mx-2 text-gray-400">→</span>
        <span>{summaryLength} words</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex justify-center gap-2">
          <button className="p-1.5 bg-gray-100 rounded text-gray-600 hover:bg-gray-200 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 bg-gray-100 rounded text-gray-600 hover:bg-gray-200 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-1.5 bg-gray-100 rounded text-gray-600 hover:bg-gray-200 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
} 