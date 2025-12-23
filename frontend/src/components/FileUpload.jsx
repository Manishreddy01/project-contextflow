import { useRef } from "react";

export default function FileUpload({ files, setFiles }) {
  const inputRef = useRef(null);

  const handleFiles = (selectedFiles) => {
    const freshList = Array.from(selectedFiles);

    // Log file directly here
    console.log("FRESH FILE OBJECT:", freshList);

    // Always use the fresh file list
    setFiles(freshList);
  };


  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="border border-dashed border-gray-300 p-3 mb-3 rounded-xl text-gray-500 bg-gray-50 hover:border-blue-400 text-sm cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current.click()}
    >
      📂 Drag & drop files here or <span className="underline">browse</span>
      <input
        type="file"
        hidden
        multiple
        ref={inputRef}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="mt-2 text-xs text-left text-gray-700 space-y-1">
          {files.map((file, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span className="truncate">{file.name}</span>
              <button
                className="text-red-500 text-xs ml-2 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
