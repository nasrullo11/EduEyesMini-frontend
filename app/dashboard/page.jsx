"use client"

import {useEffect, useState, useCallback, useRef} from "react"
import { useRouter } from "next/navigation"
import { fetchFaceDetection, logout, checkAuth, sendStudentActivity } from "/lib/api"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import ImageViewer from "@/components/ImageViewer"
import StudentActionForm from "/components/StudentActionForm"

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

    const [studentIds, setStudentIds] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedLabel, setSelectedLabel] = useState("")
    const [actionsQueue, setActionsQueue] = useState([])
    const [face_detection_id, setFaceDetectionId] = useState(0)

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

    const pollingRef = useRef(null)

    const loadDetection = useCallback(async () => {
        try {
            setLoading(true)
            setError("")
            const det = await fetchFaceDetection()
            if (det) {
                updateDetection(det)
            }
        } catch (e) {
            console.error(e)
            if (e.status === 404) {
                setError("Hozircha boshqa ma'lumot mavjud emas!")
                setSelectedLabel("")
                setStudentIds([])
                startPolling()
            } else {
                setError("Ma'lumotni olishda xatolik")
                setDetection(null)
            }
        } finally {
            setLoading(false)
        }
    }, [])

    const startPolling = () => {
        if (pollingRef.current) return

        pollingRef.current = setInterval(async () => {
            try {
                const det = await fetchFaceDetection()
                if (det) {
                    clearInterval(pollingRef.current)
                    pollingRef.current = null
                    updateDetection(det)
                }
            } catch (e) {
                if (e.status !== 404) {
                    console.error("Polling error:", e)
                    setError("Ma'lumotni olishda xatolik")
                    setDetection(null)
                } else {
                }
            }
        }, 10000)
    }

    const updateDetection = (det) => {
        setDetection(det)
        setFaceDetectionId(det.id)
        setSchoolName(det.school_name || "")
        setClassName(det.class_name || "")

        const ids = Array.from(
            new Set((det.faces || []).map(f => f.student_id).filter(Boolean))
        ).sort((a, b) => parseInt(a) - parseInt(b))

        setStudentIds(ids)
        setCurrentIndex(0)
        setSelectedLabel("")
        setActionsQueue([])
        setError("")
    }


    useEffect(() => {
        loadDetection()

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
            }
        }
    }, [loadDetection])

    useEffect(() => {
        if (isAuthChecked) {
            loadDetection()
        }
    }, [isAuthChecked, loadDetection])

    const handleAction = async () => {
        const currentId = studentIds[currentIndex]
        if (!currentId || !selectedLabel) {
            alert("Iltimos, holatni tanlang ❗")
            return
        }

        const action = {
            id: labelOptions.indexOf(selectedLabel),
            label: labelMap[selectedLabel],
        }

        const newAction = {
            student_id: parseInt(currentId, 10),
            detection,
            action,
        }

        setActionsQueue((prev) => [...prev, newAction])

        const stored = JSON.parse(localStorage.getItem("studentActions") || "[]")
        localStorage.setItem("studentActions", JSON.stringify([...stored, newAction]))

        if (currentIndex < studentIds.length - 1) {
            setCurrentIndex(currentIndex + 1)
            setSelectedLabel("")
        } else {
            try {
                const actionsToSend = JSON.parse(localStorage.getItem("studentActions") || "[]")
                let request = []
                for (const item of actionsToSend) {
                    const face = item.detection.faces.find(
                        (f) => f.student_id === item.student_id
                    )
                    const payload = {
                        event_type: "student_activity",
                        timestamp: Math.floor(
                            new Date(item.detection?.timestamp).getTime() / 1000
                        ),
                        track_id: 101,
                        face_confidence: null,
                        student_id: item.student_id,
                        camera_id: 1,
                        frame_id: item.detection?.frame_id || 5,
                        action: item.action,
                        extra_info: {
                            bbox: face
                                ? {
                                    x: face.bbox[0],
                                    y: face.bbox[1],
                                    width: face.bbox[2] - face.bbox[0],
                                    height: face.bbox[3] - face.bbox[1],
                                }
                                : null,
                            detector: "yolov8",
                            model_version: "v1.3.0",
                        },
                    }
                    request.push(payload)
                }
                await sendStudentActivity(request, face_detection_id)

                localStorage.removeItem("studentActions")
                setActionsQueue([])
                alert("Barcha ma'lumotlar yuborildi ✅")
                await loadDetection()
            } catch (e) {
                console.error(e)
                alert("Yuborishda xatolik ❌")
            }
        }
    }

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
                                    <ImageViewer
                                        detection={detection}
                                        error={error}
                                        loading={loading}
                                    />
                                </div>
                            </div>

                            <StudentActionForm
                                currentId={studentIds[currentIndex]}
                                selectedLabel={selectedLabel}
                                setSelectedLabel={setSelectedLabel}
                                labelOptions={labelOptions}
                                onSend={handleAction}
                                isLast={currentIndex === studentIds.length - 1}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
