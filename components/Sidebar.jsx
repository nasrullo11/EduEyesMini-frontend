import { Camera, BarChart3, LogOut } from "lucide-react"

export default function Sidebar({ activeTab, setActiveTab, onLogout, logoImg }) {
    return (
        <div className="fixed top-0 left-0 h-full w-72 bg-white shadow-md flex flex-col">
            <div className="p-6 border-b flex items-center justify-center">
                <img src={logoImg} alt="Logo" className="max-w-4/5" />
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                    <button
                        onClick={() => setActiveTab("rasmlar")}
                        className={`w-full cursor-pointer flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === "rasmlar"
                                ? "bg-teal-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <Camera className="w-5 h-5 mr-3" />
                        Rasmlar
                    </button>
                    <button
                        onClick={() => setActiveTab("statistika")}
                        className={`w-full cursor-pointer flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === "statistika"
                                ? "bg-teal-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <BarChart3 className="w-5 h-5 mr-3" />
                        Statistika
                    </button>
                </div>
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={onLogout}
                    className="w-full cursor-pointer flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Chiqish
                </button>
            </div>
        </div>
    )
}
