import React from "react";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

function Header({ onNewConversation }) {
  const handleNewConversation = () => {
    window.location.reload(); // Reload the page to start a new conversation
  };

  return (
    <header className="bg-white text-gray-500 p-4" aria-live="polite">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Assistant</h1>
        <button
          onClick={handleNewConversation}
          className="bg-gray-500 text-white rounded-full hover:bg-black"
          aria-label="New Conversation"
          title="New Conversation"
        >
          <PlusCircleIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default Header;
