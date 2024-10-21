import React, { useState, useEffect, useRef } from "react";
import {
  ComputerDesktopIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline"; // Import the needed icons

const FileUploadModal = ({ isOpen, onClose, onFileUpload }) => {
  const [dragOver, setDragOver] = useState(false); // Track whether file is being dragged over the region
  const modalRef = useRef(null); // Reference to the modal for focus management
  const closeButtonRef = useRef(null); // Reference to the close button for restoring focus
  const fileInputRef = useRef(null); // Reference for the file input element

  useEffect(() => {
    if (isOpen) {
      // Trap focus inside the modal when it's open
      const previouslyFocusedElement = document.activeElement;
      modalRef.current?.focus();

      const handleTabKey = (e) => {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === "Tab") {
          if (e.shiftKey) {
            // If shift+tab and focus is on the first element, move to the last element
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // If tab and focus is on the last element, move to the first element
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }

        // Close modal with Escape key
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleTabKey);

      return () => {
        document.removeEventListener("keydown", handleTabKey);
        // Restore focus to the element that triggered the modal when it's closed
        previouslyFocusedElement?.focus();
      };
    }
  }, [isOpen, onClose]);

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

  const handleFileButtonKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      fileInputRef.current.click(); // Simulate a click on the hidden file input
    }
  };

  if (!isOpen) return null; // Do not render if modal is not open

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose} // Close modal when overlay is clicked
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-upload-title"
      aria-describedby="file-upload-description"
      tabIndex="-1"
      ref={modalRef} // Modal container for focus management
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-96"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside the modal
        role="document"
      >
        <h2 id="file-upload-title" className="sr-only">
          File Upload Modal
        </h2>
        <p id="file-upload-description" className="sr-only">
          Upload a file from your computer or select a file from Google Drive or
          OneDrive.
        </p>

        {/* Drag-and-drop area is hidden on mobile but visible on larger screens */}
        <div
          className={`border-2 border-dashed p-6 mb-4 flex flex-col justify-center items-center ${
            dragOver ? "border-blue-500 bg-blue-100" : "border-gray-400"
          } hover:border-blue-400 transition-all duration-300 hidden sm:flex`} // Hidden on mobile and hover state added
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ height: "150px" }}
          aria-label="Drag and drop your files here"
          role="button"
          tabIndex="0"
        >
          <CloudArrowUpIcon className="h-10 w-10 text-blue-500 mb-4" />
          <p className="text-center text-gray-500">Drag and drop</p>
        </div>

        <label className="block">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="application/pdf"
            aria-label="Select a file to upload"
          />
          <div
            className="bg-gray-700 text-white mb-6 rounded-full py-2 text-center cursor-pointer hover:bg-gray-600"
            tabIndex="0"
            role="button"
            aria-labelledby="browse-files-label"
            onKeyDown={handleFileButtonKeyPress} // Handle "Enter" or "Space" to trigger file input
          >
            <span
              id="browse-files-label"
              className="flex justify-center items-center space-x-2"
            >
              <ComputerDesktopIcon className="h-5 w-5 text-white" />{" "}
              <span>Browse files on Desktop</span>
            </span>
          </div>
        </label>

        <hr />

        <button
          disabled
          className="bg-gray-200 text-gray-800 mt-6 py-2 text-center cursor-pointer hover:bg-gray-100 hover:text-black w-full"
          aria-disabled="true"
        >
          <span className="flex justify-center items-center space-x-2">
            <CloudArrowUpIcon className="h-5 w-5 text-gray-800 hover:text-black" />{" "}
            <span>Add file from Google Drive</span>
          </span>
        </button>

        <button
          disabled
          className="bg-gray-200 text-gray-800 mt-6 py-2 text-center cursor-pointer hover:bg-gray-100 hover:text-black w-full"
          aria-disabled="true"
        >
          <span className="flex justify-center items-center space-x-2">
            <CloudArrowUpIcon className="h-5 w-5 text-gray-800 hover:text-black" />{" "}
            <span>Add file from OneDrive</span>
          </span>
        </button>

        <button
          ref={closeButtonRef} // Reference to focus when the modal opens
          onClick={onClose}
          className="mt-4 text-center text-blue-500 underline w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close file upload modal"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FileUploadModal;
