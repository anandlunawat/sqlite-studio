import Editor from "@monaco-editor/react";
import { useRef } from "react";

export default function SqlTerminal() {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="w-full h-[300px] bg-[#1e1e1e] rounded-md overflow-hidden border border-gray-600"
        >
            <div className="flex items-center px-3 py-1 bg-[#2d2d2d] text-white text-sm font-mono border-b border-gray-700">
                <div className="flex space-x-2 mr-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                SQLite Terminal
            </div>
            <div className="h-full w-full">
                <Editor
                    height={"600px"}
                    width={"600px"}
                    defaultLanguage="sql"
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        lineNumbers: "off",
                        fontSize: 14,
                        fontFamily: "monospace",
                        scrollbar: { vertical: "hidden", horizontal: "hidden" },
                        wordWrap: "on",
                        padding: { top: 10, bottom: 10 },
                        automaticLayout: true,
                        renderLineHighlight: "none",
                    }}
                />
            </div>
        </div>
    );
}
