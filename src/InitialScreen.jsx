import React from "react";

function InitialScreen({ setPendingPrompt, openModal }) {
  const handleExamplePrompt = (prompt) => {
    setPendingPrompt(prompt); // Set the prompt, but don't populate the input yet
    openModal(); // Open the file upload modal
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4"
      role="main"
      aria-labelledby="assistant-title"
    >
      <img
        src="https://harvard-openai-assistants.s3.amazonaws.com/assets/Harvard_University_shield.svg"
        alt="Harvard University shield"
        className="w-24 h-24 object-contain"
        aria-hidden="true"
      />
      <h1 id="assistant-title" className="text-2xl font-semibold text-gray-800">
        AI Assistant
      </h1>
      <p className="text-gray-600 max-w-md" aria-live="polite">
        I'm your assistant! I can help you with a variety of tasks, such as
        answering questions, providing recommendations, and more.
      </p>
      <div className="space-y-2 space-x-2">
        <button
          className="bg-gray-700 text-white rounded-full px-4 py-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={() => handleExamplePrompt("Perform Task 1")}
          aria-label="Task 1"
        >
          Task 1
        </button>
        <button
          className="bg-gray-700 text-white rounded-full px-4 py-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={() => handleExamplePrompt("Perform Task 2")}
          aria-label="Task 2"
        >
          Task 2
        </button>
        <button
          className="bg-gray-700 text-white rounded-full px-4 py-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={() => handleExamplePrompt("Perform Task 3")}
          aria-label="Task 3"
        >
          Task 3
        </button>
      </div>
    </div>
  );
}

export default InitialScreen;
