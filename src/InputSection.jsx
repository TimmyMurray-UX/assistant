import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useLayoutEffect,
} from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const InputSection = forwardRef(
  (
    {
      onSendMessage,
      fileTexts,
      setFileTexts,
      extractTextFromPDF,
      fileInputRef,
    },
    ref
  ) => {
    const [userInput, setUserInput] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]); // State for managing selected files
    const [loadingFiles, setLoadingFiles] = useState(false); // State for loading indicator
    const textareaRef = useRef(null);

    useImperativeHandle(ref, () => ({
      setUserInput,
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
      const combinedFileText = Object.values(fileTexts).join("\n");
      const message = combinedFileText + userInput;

      if (message.trim()) {
        onSendMessage(message);
        setUserInput(""); // Clear the input after sending
      }
    };

    const handleFileChange = async (event) => {
      const files = Array.from(event.target.files);

      if (files.length > 0) {
        setLoadingFiles(true);
        setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

        for (const file of files) {
          if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            await extractTextFromPDF(file); // Call the function passed from App.jsx
          } else {
            console.warn("Unsupported file type:", file.type);
          }
        }

        setLoadingFiles(false);
        event.target.value = null; // Clear the file input after processing
      }
    };

    const removeFile = (fileToRemove) => {
      // First, update the local selectedFiles state
      setSelectedFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file !== fileToRemove);

        // If no files remain, clear the input and fileTexts
        if (updatedFiles.length === 0) {
          setUserInput(""); // Clear the text box
          setTimeout(() => {
            // Use setTimeout to prevent state updates during render
            setFileTexts({}); // Clear the fileTexts that display in <pre>
          }, 0);
        }

        return updatedFiles;
      });
    };

    return (
      <div className="p-4">
        <div className="flex flex-col items-center max-w-3xl mx-auto relative w-full">
          <div className="flex flex-col items-start w-full relative p-2 rounded-3xl shadow-sm bg-gray-100 text-black">
            {/* Display fileTexts in the <pre> tag */}
            {Object.values(fileTexts).length > 0 && (
              <pre className="w-full bg-gray-200 p-4 rounded-md mb-4 overflow-auto max-h-64 whitespace-pre-wrap">
                {Object.values(fileTexts).join("\n")}
              </pre>
            )}

            {selectedFiles.length > 0 && (
              <div className="flex space-x-2 mb-2 overflow-x-auto w-full">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm text-gray-600"
                    style={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}
                  >
                    <span className="mr-2">{file.name}</span>
                    <XCircleIcon
                      className="h-4 w-4 text-red-500 cursor-pointer"
                      onClick={() => removeFile(file)}
                      aria-label="Remove file"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end space-x-2 bg-gray-100 rounded-lg p-0 w-full">
              {/* Paperclip icon for attaching files */}
              <div className="flex items-center p-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <PaperClipIcon className="h-8 w-8 text-black hover:text-gray-400" />
                  <input
                    id="file-upload"
                    ref={fileInputRef} // Bind the ref here
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="sr-only"
                    accept="application/pdf"
                  />
                </label>
              </div>

              {/* Textarea for user input */}
              <div className="flex-grow">
                <textarea
                  ref={textareaRef}
                  className="bg-transparent flex-grow outline-none w-full resize-none overflow-hidden h-auto max-h-32 p-2 leading-relaxed"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  rows={1}
                />
              </div>

              {/* Send button */}
              <div className="flex items-center p-2">
                <button
                  onClick={handleSend}
                  className={`p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400`}
                  aria-label="Send Message"
                  title="Send Message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default InputSection;
