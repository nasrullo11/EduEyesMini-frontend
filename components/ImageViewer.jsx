import { useEffect, useRef, useState } from "react"

export default function ImageViewer({ detection, error, loading }) {
    const imgRef = useRef(null)
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
    const natSize = { w: 3840, h: 2160 }

    const onImgLoad = () => {
        if (!imgRef.current) return
        setImgSize({
            w: imgRef.current.clientWidth,
            h: imgRef.current.clientHeight,
        })
    }

    useEffect(() => {
        const onResize = () => {
            if (!imgRef.current) return
            setImgSize({
                w: imgRef.current.clientWidth,
                h: imgRef.current.clientHeight,
            })
        }
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    if (loading) return <p className="text-gray-500">Yuklanmoqda...</p>
    if (error) return <p className="text-red-600">{error}</p>
    if (!detection) return null

    return (
        <div className="relative inline-block">
            <img
                ref={imgRef}
                src={detection?.image_name || ""}
                alt="Face detection"
                className="block h-[600px] max-w-full rounded-md"
                onLoad={onImgLoad}
            />
            {detection.faces?.map((face, i) => {
                const { student_id, bbox } = face
                const [x1, y1, x2, y2] = bbox
                const boxW = x2 - x1
                const boxH = y2 - y1

                const left = x1 * (imgSize.w / natSize.w)
                const top = y1 * (imgSize.h / natSize.h)
                const width = (boxW / natSize.w) * imgSize.w
                const height = (boxH / natSize.h) * imgSize.h

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left,
                            top,
                            width,
                            height,
                            border: `2px solid ${student_id ? "limegreen" : "red"}`,
                            boxSizing: "border-box",
                        }}
                    >
            <span className="absolute -top-6 left-0 bg-black text-white text-xs px-2 py-1 rounded">
              {student_id || "Unknown"}
            </span>
                    </div>
                )
            })}
        </div>
    )
}
