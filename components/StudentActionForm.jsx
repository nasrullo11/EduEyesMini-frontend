import { Send, ArrowRight } from "lucide-react"

export default function StudentActionForm({
                                              currentId,
                                              selectedLabel,
                                              setSelectedLabel,
                                              labelOptions,
                                              onSend,
                                              isLast,
                                          }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4">
            <div className="text-center border px-3 py-4 rounded-md text-lg w-40 bg-gray-50 text-gray-800">
                {currentId || "--"}
            </div>

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
                onClick={onSend}
                className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-10 py-4 rounded-md flex items-center"
            >
                {isLast ? (
                    <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Keyingi rasm
                    </>
                ) : (
                    <>
                        <Send className="w-4 h-4 mr-2" />
                        Jo'natish
                    </>
                )}
            </button>
        </div>
    )
}
