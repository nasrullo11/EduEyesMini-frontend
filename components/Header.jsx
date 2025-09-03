import { User } from "lucide-react"

export default function Header({ activeTab, user }) {
    return (
        <header className="fixed top-0 left-72 right-0 bg-white shadow-sm border-b px-6 py-6 z-10">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                    {activeTab === "rasmlar" ? "Rasmlar" : "Statistika"}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                        {user
                            ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                            : "User"}
                    </span>
                    <div className="flex items-center justify-center p-3 ml-2 bg-teal-600 rounded-full">
                        <User className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
        </header>
    )
}
