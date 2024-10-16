import React, { useState } from "react";
import {
  ComputerDesktopIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline"; // Import the needed icons

const FileUploadModal = ({ isOpen, onClose, onFileUpload }) => {
  const [dragOver, setDragOver] = useState(false); // Track whether file is being dragged over the region

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true); // Set dragOver to true when the file is being dragged over
  };

  const handleDragLeave = () => {
    setDragOver(false); // Set dragOver to false when the file leaves the drag area
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false); // Reset dragOver when the file is dropped
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  return (
    isOpen && (
      <div
        className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
        onClick={onClose} // Close modal when overlay is clicked
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg w-96"
          onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside the modal
        >
          {/* Drag-and-drop area is hidden on mobile but visible on larger screens */}
          <div
            className={`border-2 border-dashed p-6 mb-4 flex flex-col justify-center items-center ${
              dragOver ? "border-blue-500 bg-blue-100" : "border-gray-400"
            } hover:border-blue-400 transition-all duration-300 hidden sm:flex`} // Hidden on mobile and hover state added
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ height: "150px" }}
          >
            <CloudArrowUpIcon className="h-10 w-10 text-blue-500 mb-4" />
            <p className="text-center text-gray-500">Drag and drop</p>
          </div>

          <label className="block">
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="application/pdf"
            />
            <div className="bg-gray-700 text-white rounded-full py-2 text-center cursor-pointer hover:bg-gray-600">
              <span className="flex justify-center items-center space-x-2">
                <ComputerDesktopIcon className="h-5 w-5 text-white" />{" "}
                <span>Browse files</span>
              </span>
            </div>
          </label>

          <button
            onClick={onClose}
            className="mt-4 text-center text-blue-500 underline w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  );
};

export default FileUploadModal;
