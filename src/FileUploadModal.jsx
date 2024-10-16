import React, { useState } from "react";

const FileUploadModal = ({ isOpen, onClose, onFileUpload }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
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
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4 text-center">Upload a File</h2>
          <div
            className={`border-2 border-dashed ${
              dragOver ? "border-blue-500" : "border-gray-400"
            } p-6 mb-4 flex justify-center items-center text-gray-500`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="text-center">
              Drag your file here or{" "}
              <label className="text-blue-500 cursor-pointer">
                browse
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="application/pdf"
                />
              </label>{" "}
              from your computer.
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-red-500 text-white rounded-full px-4 py-2 w-full hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    )
  );
};

export default FileUploadModal;
