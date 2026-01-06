import { useRef } from "react";

export default function FileUpload({ files, setFiles }) {
  const inputRef = useRef(null);

  const handleFiles = (selectedFiles) => {
    const freshList = Array.from(selectedFiles || []);
    setFiles(freshList);
  };

  return (
    <div className="mt-2">
      {/* hidden input, triggered by + button in ChatInput */}
      <input
        id="file-input-hidden"
        type="file"
        multiple
        ref={inputRef}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* show selected files as chips */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 border border-gray-200"
            >
              <span className="truncate max-w-[140px]">{file.name}</span>
              <button
                type="button"
                className="text-gray-500 hover:text-red-500 text-[11px]"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== idx))
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
