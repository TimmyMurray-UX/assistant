import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import FileUploadModal from "./FileUploadModal"; // Import the FileUploadModal component

const InputSection = forwardRef(
  (
    { onSendMessage, fileTexts, setFileTexts, extractTextFromPDF, openModal },
    ref
  ) => {
    const [userInput, setUserInput] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]); // State for managing selected files
    const [isModalOpen, setIsModalOpen] = useState(false); // Track modal open state
    const textareaRef = useRef(null);

    useImperativeHandle(ref, () => ({
      setUserInput,
      // Add uploaded file to the selected files
      addUploadedFile: (file) => {
        setSelectedFiles((prevFiles) => [...prevFiles, file]); // Add new file to the selectedFiles array
      },
    }));

    const handleInputChange = (e) => {
      const input = e.target.value;
      setUserInput(input);
    };

    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto"; // Reset height to auto
        textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height to fit content
      }
    };

    useLayoutEffect(() => {
      adjustTextareaHeight();
    }, [userInput]);

    const handleSend = () => {
      const combinedFileText = Object.values(fileTexts).join("\n"); // PDF text
      const messageToSend = combinedFileText + userInput; // Full message with PDF + prompt text
      const promptMessage = userInput; // Only the prompt text
      const fileName = selectedFiles.length > 0 ? selectedFiles[0].name : null; // Get the file name

      if (messageToSend.trim()) {
        // Pass the full message, display message, file name, and file content
        onSendMessage({
          fullMessage: messageToSend,
          displayMessage: promptMessage,
          fileName,
          fileContent: combinedFileText,
        });
        setUserInput(""); // Clear the input after sending
        setSelectedFiles([]); // Clear selected files
        setFileTexts({}); // Clear the fileTexts in <pre> tags
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent new line being added on Enter
        handleSend(); // Send message on Enter
      }
    };

    const removeFile = (fileToRemove) => {
      setSelectedFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file !== fileToRemove);

        // Clear text input and fileTexts when no files are left
        if (updatedFiles.length === 0) {
          setUserInput(""); // Clear the text box
          setFileTexts({}); // Clear the fileTexts that display in <pre>
        }

        return updatedFiles;
      });
    };

    // Define the handleFileUpload function to handle file uploads from the modal
    const handleFileUpload = (files) => {
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
      setIsModalOpen(false); // Close the modal after file upload
      textareaRef.current?.focus(); // Move focus to input box after modal closes
    };

    // Automatically move focus to the input box when the <pre> tag (fileTexts) is not empty
    useEffect(() => {
      if (Object.values(fileTexts).length > 0 && textareaRef.current) {
        textareaRef.current.focus(); // Move focus to the input box
      }
    }, [fileTexts]);

    return (
      <div className="p-4" role="form" aria-label="Input Section">
        <div className="flex flex-col items-center max-w-3xl mx-auto relative w-full">
          <div
            className="flex flex-col items-start w-full relative rounded-3xl shadow-sm bg-gray-100 text-black"
            aria-live="polite"
          >
            {/* Display fileTexts in the <pre> tag */}
            {Object.values(fileTexts).length > 0 && (
              <div className="p-2" aria-live="polite">
                <pre
                  className="w-full bg-gray-200 p-4 rounded-3xl mb-4 overflow-auto max-h-64 whitespace-pre-wrap"
                  aria-label="PDF text preview"
                  tabIndex="0" // Ensure that this content is focusable by keyboard if necessary
                >
                  {Object.values(fileTexts).join("\n")}
                </pre>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div
                className="flex space-x-2 mb-2 overflow-x-auto p-2 w-full"
                aria-live="polite"
              >
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm text-gray-600"
                    style={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}
                    aria-label={`Selected file: ${file.name}`}
                    tabIndex="0" // Make file item focusable for keyboard users
                  >
                    <span className="mr-2">{file.name}</span>
                    <button
                      onClick={() => removeFile(file)}
                      className="focus:outline-none"
                      aria-label={`Remove file ${file.name}`}
                    >
                      <XCircleIcon className="h-4 w-4 text-red-500 cursor-pointer" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end space-x-2 bg-gray-100 rounded-full p-0 w-full">
              {/* Paperclip icon for attaching files */}
              <div className="flex items-center p-2">
                <button
                  className="focus:outline-none focus:ring-2 focus:ring-gray-400 p-1 rounded-full"
                  onClick={() => setIsModalOpen(true)} // Open the modal
                  aria-label="Attach file"
                  title="Attach file"
                >
                  <PaperClipIcon
                    className="h-8 w-8 text-black hover:text-gray-400"
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Textarea for user input */}
              <div className="flex-grow">
                <textarea
                  ref={textareaRef}
                  className="bg-transparent flex-grow outline-none w-full resize-none overflow-hidden h-auto max-h-32 p-2 leading-relaxed"
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown} // Capture Enter key press
                  placeholder="Type a message..."
                  rows={1}
                  aria-label="Message input"
                />
              </div>

              {/* Send button */}
              <div className="flex items-center p-2">
                <button
                  onClick={handleSend}
                  className={`p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    userInput.trim() === ""
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  aria-label="Send Message"
                  title="Send Message"
                  disabled={userInput.trim() === ""} // Disable when there is no text
                >
                  <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Modal */}
        <FileUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onFileUpload={handleFileUpload} // Use handleFileUpload here
          inputBoxRef={textareaRef} // Pass the input box ref to move focus after file upload
        />

        {/* Footer section */}
        <footer className="p-4 text-center text-xs text-gray-500">
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="Digital Accessibility"
          >
            Digital Accessibility
          </a>{" "}
          |{" "}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="Privacy Policy"
          >
            Privacy
          </a>{" "}
          |{" "}
          <a href="#" target="_blank" rel="noreferrer" aria-label="Help">
            Help
          </a>
        </footer>
      </div>
    );
  }
);

export default InputSection;
