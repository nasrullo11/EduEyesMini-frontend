"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {fetchFaceDetection, logout, API_URL, checkAuth} from "/lib/api"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import ImageViewer from "@/components/ImageViewer"
import StudentActionForm from "@/components/StudentActionForm"

export default function Dashboard() {
    const router = useRouter()
    const [isAuthChecked, setIsAuthChecked] = useState(false)
    const [user, setUser] = useState(null)
    const [activeTab, setActiveTab] = useState("rasmlar")
    const [schoolName, setSchoolName] = useState("")
    const [className, setClassName] = useState("")

    const [detection, setDetection] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [selectedStudent, setSelectedStudent] = useState("")
    const [selectedLabel, setSelectedLabel] = useState("")
    const labelOptions = [
        "Qo'l ko'tarmoqda",
        "O'qimoqda",
        "Yozmoqda",
        "Boshni aylantirish",
        "Boshini egish",
        "Telefon ishlatmoqda",
    ]
    const labelMap = {
        "Qo'l ko'tarmoqda": "Hand-raising",
        "O'qimoqda": "Reading",
        "Yozmoqda": "Writing",
        "Boshni aylantirish": "Turning head",
        "Boshini egish": "Bowing head",
        "Telefon ishlatmoqda": "Phone use",
    }

    useEffect(() => {
        const verify = async () => {
            const access = localStorage.getItem("access")
            if (!access) {
                router.replace("/login")
                return
            }

            try {
                const userData = await checkAuth(access)
                setUser(userData)
                setIsAuthChecked(true)
            } catch (err) {
                console.error("Auth check failed:", err)
                localStorage.removeItem("access")
                localStorage.removeItem("refresh")
                localStorage.removeItem("username")
                router.replace("/login")
            }
        }
        verify()
    }, [router])

    useEffect(() => {
        if (!isAuthChecked) return
            ;(async () => {
            try {
                setLoading(true)
                setError("")
                const det = await fetchFaceDetection()
                if (det) {
                    setDetection(det)
                    setSchoolName(det.school_name || "")
                    setClassName(det.class_name || "")
                }
            } catch (e) {
                console.error(e)
                setError("Ma'lumotni olishda xatolik")
            } finally {
                setLoading(false)
            }
        })()
    }, [isAuthChecked])

    const logoImg = "/logo.png"

    if (!isAuthChecked) return null

    return (
        <div className="h-screen bg-gray-100 flex">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={async () => {
                    try {
                        const access = localStorage.getItem("access")
                        const refresh = localStorage.getItem("refresh")
                        if (access && refresh) {
                            await logout(access, refresh)
                        }
                    } catch (err) {
                        console.error("Logout failed:", err)
                    } finally {
                        localStorage.removeItem("access")
                        localStorage.removeItem("refresh")
                        localStorage.removeItem("username")
                        router.push("/login")
                    }
                }}
                logoImg={logoImg}
            />

            <div className="flex-1 flex flex-col ml-72">
                <Header activeTab={activeTab} user={user} />

                <main className="flex-1 overflow-y-auto mt-[88px] p-6">
                    {activeTab === "rasmlar" && (
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <h2 className="font-medium text-lg">
                                        Maktab:
                                        <span className="font-normal text-gray-600">
                                            {" "}
                                            {schoolName}
                                        </span>
                                    </h2>
                                    <h2 className="font-medium text-lg ml-20">
                                        Sinf:
                                        <span className="font-normal text-gray-600">
                                            {" "}
                                            {className}
                                        </span>
                                    </h2>
                                </div>
                                <div className="text-gray-700 font-medium">
                                    <span className="font-medium text-lg">Vaqt: </span>
                                    {detection?.timestamp &&
                                        new Date(detection?.timestamp).toLocaleString("uz-UZ", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: false,
                                        })}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-2">
                                <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
                                    <ImageViewer detection={detection} error={error} loading={loading} />
                                </div>
                            </div>

                            <StudentActionForm
                                detection={detection}
                                selectedStudent={selectedStudent}
                                setSelectedStudent={setSelectedStudent}
                                selectedLabel={selectedLabel}
                                setSelectedLabel={setSelectedLabel}
                                labelOptions={labelOptions}
                                labelMap={labelMap}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
