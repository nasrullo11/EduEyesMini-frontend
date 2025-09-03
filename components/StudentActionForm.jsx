import { Send } from "lucide-react"
import { sendStudentActivity } from "../lib/api"

export default function StudentActionForm({
                                              detection,
                                              selectedStudent,
                                              setSelectedStudent,
                                              selectedLabel,
                                              setSelectedLabel,
                                              labelOptions,
                                              labelMap,
                                          }) {
    const handleSend = async () => {
        if (!selectedStudent || !selectedLabel) {
            alert("Iltimos, student va holatni tanlang ❗")
            return
        }

        const action = {
            id: labelOptions.indexOf(selectedLabel),
            label: labelMap[selectedLabel],
        }

        const face = detection?.faces?.find((f) => f.student_id === selectedStudent)

        const payload = {
            event_type: "student_activity",
            timestamp: Math.floor(new Date(detection?.timestamp).getTime() / 1000),
            track_id: 101,
            face_confidence: null,
            student_id: parseInt(selectedStudent, 10),
            camera_id: 1,
            frame_id: detection?.frame_id || 5,
            action,
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

        try {
            await sendStudentActivity(payload)
            alert("Ma'lumot yuborildi ✅")
        } catch (e) {
            console.error(e)
            alert("Yuborishda xatolik ❌")
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
            <label className="font-medium">O'quvchi ID:</label>
            <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="border px-2 py-4 rounded-md text-base w-40"
            >
                <option value="">-- ID tanlang --</option>
                {Array.from(
                    new Set(
                        (detection?.faces || []).map((f) => f.student_id).filter(Boolean)
                    )
                ).map((id) => (
                    <option key={id} value={id}>
                        {id}
                    </option>
                ))}
            </select>

            <select
                value={selectedLabel}
                onChange={(e) => setSelectedLabel(e.target.value)}
                className="border px-3 py-4 rounded-md text-lg flex-1"
            >
                <option value="">-- Holatni tanlang --</option>
                {labelOptions.map((l) => (
                    <option key={l} value={l}>
                        {l}
                    </option>
                ))}
            </select>

            <button
                onClick={handleSend}
                className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-10 py-4 rounded-md flex items-center"
            >
                <Send className="w-4 h-4 mr-2" />
                Jo'natish
            </button>
        </div>
    )
}
