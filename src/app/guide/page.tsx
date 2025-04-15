import Header from "@/components/layout/Header";
import Link from "next/link";

export default function GuidePage() {
  return (
    <main>
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">How to Use SummryAI</h1>
          
          <div className="max-w-3xl mx-auto space-y-16">
            <GuideStep 
              number={1}
              title="Log in with your Google Account"
              description="Click the 'Sign In' button in the top right corner and use your Google account to access SummryAI."
              imageUrl="https://placehold.co/800x400/e0f2fe/1d4ed8?text=Login+Screen&font=montserrat"
            />
            
            <GuideStep 
              number={2}
              title="Input Your Text"
              description="Enter the text you want to summarize by pasting, typing directly into the input panel, or clicking the upload button to select a file from your device."
              imageUrl="https://placehold.co/800x400/e0f2fe/1d4ed8?text=Input+Text+or+Upload&font=montserrat"
            />
            
            <GuideStep 
              number={3}
              title="Adjust Summarization Options"
              description="Click the 'Summarization Options' button to customize the length, style, and complexity of your summary."
              imageUrl="https://placehold.co/800x400/e0f2fe/1d4ed8?text=Adjust+Options&font=montserrat"
            />
            
            <GuideStep 
              number={4}
              title="Click the Summarize Button"
              description="Hit the 'Summarize' button and watch as our AI technology works its magic to create your summary."
              imageUrl="https://placehold.co/800x400/e0f2fe/1d4ed8?text=Summarize+Button&font=montserrat"
            />
            
            <GuideStep 
              number={5}
              title="View and Use Your Summary"
              description="Your summary will appear in the right panel. From here, you can copy, download, or share it as needed."
              imageUrl="https://placehold.co/800x400/e0f2fe/1d4ed8?text=View+Summary&font=montserrat"
            />
          </div>
          
          <div className="mt-16 text-center">
            <Link href="/summarize" className="btn btn-primary px-8 py-3 text-lg">
              Try SummryAI Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function GuideStep({ 
  number, 
  title, 
  description, 
  imageUrl 
}: { 
  number: number;
  title: string;
  description: string;
  imageUrl: string;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {number}
        </div>
      </div>
      
      <div className="flex-grow">
        <h2 className="text-xl font-semibold mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="rounded-lg overflow-hidden shadow-sm">
          <img src={imageUrl} alt={title} className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
} 