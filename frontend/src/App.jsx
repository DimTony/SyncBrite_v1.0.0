import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import "./App.css";
import { ChatProvider } from "./contexts/ChatContext";

function App() {
  return (
    <>
      <div className="App">
        <ChatProvider>
          <Routes>
            <Route path="/" exact Component={HomePage} />
            <Route path="/chats" exact Component={ChatPage} />
          </Routes>
        </ChatProvider>
      </div>
    </>
  );
}

export default App;
