"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "/lib/api"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const { access, refresh } = await login(username, password)

            localStorage.setItem("access", access)
            localStorage.setItem("refresh", refresh)
            localStorage.setItem("username", username)

            router.push("/dashboard")
        } catch (err) {
            if (err.response) {
                setError("Login yoki parol xato")
            } else if (err.request) {
                setError("Serverda xatolik")
            } else {
                setError("Noma’lum xatolik yuz berdi")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Tizimga Kirish</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-white/80 text-sm mb-2">
                            Foydalanuvchi nomi kiriting
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:ring-2 focus:ring-teal-300 focus:outline-none"
                            placeholder="Foydalanuvchi nomi"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/80 text-sm mb-2">Parol kiriting</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white border-0 focus:ring-2 focus:ring-teal-300 focus:outline-none"
                            placeholder="Parol"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Kirilmoqda..." : "Kirish"}
                    </button>
                </form>
            </div>
        </div>
    )
}
