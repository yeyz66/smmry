'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SummaryResult } from "@/hooks/useSummarize";
import { FileText, Download, Copy } from "lucide-react";
import { jsPDF } from "jspdf";

export default function SharedSummaryDisplay() {
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = searchParams.get('data');
    
    if (!data) {
      setError("未找到摘要数据");
      setLoading(false);
      return;
    }
    
    try {
      const decodedData = JSON.parse(decodeURIComponent(data));
      setSummary(decodedData);
    } catch (err) {
      console.error("Failed to parse summary data:", err);
      setError("无法解析摘要数据");
    }
    
    setLoading(false);
  }, [searchParams]);

  // 复制摘要
  const handleCopy = async () => {
    if (!summary?.summary) return;
    
    try {
      await navigator.clipboard.writeText(summary.summary);
      alert("摘要已复制到剪贴板！");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("无法复制摘要，请手动复制。");
    }
  };

  // 下载PDF
  const handleDownloadPDF = () => {
    if (!summary?.summary) return;
    
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("SummryAI - Shared Summary", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Original: ${summary.metadata.originalWordCount} words`, 20, 30);
      doc.text(`Summary: ${summary.metadata.summaryWordCount} words (${summary.metadata.percentReduced}% reduction)`, 20, 37);
      
      doc.setFontSize(14);
      doc.text("Summary:", 20, 50);
      
      const summaryText = summary.summary;
      const textLines = doc.splitTextToSize(summaryText, 170);
      
      doc.text(textLines, 20, 60);
      
      const today = new Date();
      const dateStr = today.toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Generated: ${dateStr}`, 20, 280);
      
      doc.save("shared-summary.pdf");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-500 mr-2" />
            <h1 className="text-2xl font-bold">Shared Summary</h1>
          </div>
          
          <div className="flex gap-2">
            <button 
              className={`p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors ${!summary?.summary ? 'opacity-50 cursor-not-allowed' : ''}`} 
              title="Copy"
              onClick={handleCopy}
              disabled={!summary?.summary}
            >
              <Copy className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200 transition-colors ${!summary?.summary ? 'opacity-50 cursor-not-allowed' : ''}`} 
              title="Download as PDF"
              onClick={handleDownloadPDF}
              disabled={!summary?.summary}
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">
              {error}
            </div>
          ) : summary ? (
            <div>
              <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                <div>
                  原文: <span className="font-medium">{summary.metadata.originalWordCount} 词</span>
                </div>
                <div>
                  摘要: <span className="font-medium">{summary.metadata.summaryWordCount} 词</span> 
                  <span className="ml-2">({summary.metadata.percentReduced}% 减少)</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-5 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">摘要</h2>
                <div className="text-gray-700 leading-relaxed">
                  {summary.metadata.style === 'bullet-points' ? (
                    <div dangerouslySetInnerHTML={{ __html: summary.summary.replace(/\n/g, '<br />') }} />
                  ) : (
                    <p>{summary.summary}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  使用 <span className="text-blue-500 font-medium">SummryAI</span> 生成
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 text-gray-500">
              未找到摘要数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 