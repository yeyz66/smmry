import Header from "@/components/layout/Header";
import { 
  UserCircle, 
  Bell, 
  Key, 
  CreditCard, 
  Globe, 
  EyeIcon, 
  Code, 
  HelpCircle 
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <main>
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
          <h1 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-200">Account Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
            {/* Settings Navigation */}
            <div className="border-r border-gray-200 pr-6">
              <nav>
                <ul className="space-y-1">
                  <SettingsNavItem 
                    icon={<UserCircle className="w-5 h-5" />} 
                    label="Profile" 
                    href="#profile" 
                    isActive={true} 
                  />
                  <SettingsNavItem 
                    icon={<Bell className="w-5 h-5" />} 
                    label="Notifications" 
                    href="#notifications" 
                  />
                  <SettingsNavItem 
                    icon={<Key className="w-5 h-5" />} 
                    label="API Keys" 
                    href="#api-keys" 
                  />
                  <SettingsNavItem 
                    icon={<CreditCard className="w-5 h-5" />} 
                    label="Billing" 
                    href="#billing" 
                  />
                  <SettingsNavItem 
                    icon={<Globe className="w-5 h-5" />} 
                    label="Language" 
                    href="#language" 
                  />
                  <SettingsNavItem 
                    icon={<EyeIcon className="w-5 h-5" />} 
                    label="Appearance" 
                    href="#appearance" 
                  />
                  <SettingsNavItem 
                    icon={<Code className="w-5 h-5" />} 
                    label="Integrations" 
                    href="#integrations" 
                  />
                  <SettingsNavItem 
                    icon={<HelpCircle className="w-5 h-5" />} 
                    label="Help & Support" 
                    href="#support" 
                  />
                </ul>
              </nav>
            </div>
            
            {/* Settings Content */}
            <div className="px-4">
              <div id="profile" className="mb-10">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block mb-2 font-medium">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block mb-2 font-medium">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block mb-2 font-medium">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block mb-2 font-medium">Bio</label>
                    <textarea
                      id="bio"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="AI enthusiast and researcher"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <div id="api-keys" className="mb-10">
                <h2 className="text-xl font-semibold mb-6">API Keys</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block mb-2 font-medium">Your API Key</label>
                    <div className="flex">
                      <input
                        type="password"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value="•••••••••••••••••••••••••••••••"
                        readOnly
                      />
                      <button className="px-4 py-2 bg-gray-100 border border-gray-200 border-l-0 rounded-r-md hover:bg-gray-200 transition-colors">
                        Show
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Use this key to authenticate your requests to the SummryAI API.
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <button className="btn btn-outline mr-4">
                      Generate New Key
                    </button>
                    <span className="text-sm text-gray-500">Last generated: 15 days ago</span>
                  </div>
                </div>
              </div>
              
              <button className="btn btn-primary mt-6">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SettingsNavItem({ 
  icon, 
  label, 
  href, 
  isActive = false 
}: { 
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
          isActive 
            ? "bg-gray-100 text-blue-500 font-medium" 
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
} 