import React from "react";
/*(import harvardShield from * "./assets/Harvard_University_shield.svg";*/

function InitialScreen({ onSendMessage }) {
  const handleExamplePrompt = (prompt) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
      <img
        /*src={harvardShield}*/
        src="https://harvard-openai-assistants.s3.amazonaws.com/assets/Harvard_University_shield.svg"
        alt="Harvard University shield"
        className="w-24 h-24 object-contain"
      />
      <h1 className="text-2xl font-semibold text-gray-800">AI Assistant</h1>
      <p className="text-gray-600 max-w-md">
        I'm your assistant! I can help you with a variety of tasks, such as
        answering questions, providing recommendations, and more.
      </p>
      <div className="space-y-2 space-x-2">
        <button
          className="bg-gray-700 text-white rounded-full px-4 py-2 hover:bg-gray-600"
          onClick={() => handleExamplePrompt("Describe this document's key points in bullet points, and provide a one paragraph worded summary of the document in a separate section.")}
        >
          Summarize DUA
        </button>
        <button
          className="bg-gray-700 text-white rounded-full px-4 py-2 hover:bg-gray-600"
          onClick={() => handleExamplePrompt("Taking into account the agreement_metadata.json, match the DUA file with the appropriate JSON entry, and extract the 'Days Submit to Active', and any other start and end date fields")}
        >
          DUA Estimated Time
        </button>
        <button
          className="bg-gray-700 text-white rounded-full px-4 py-2 hover:bg-gray-600"
          onClick={() => handleExamplePrompt("What has changed in the DUA between the document I am providing as part of the context and the file(s) available in your storage? Pull out the information into sections and BOLD anything that has been added or removed.")}
        >
          Redline
        </button>
      </div>
    </div>
  );
}

export default InitialScreen;
