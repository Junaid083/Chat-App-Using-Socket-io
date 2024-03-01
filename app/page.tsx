"use client";
import { io } from "socket.io-client";
import { useState } from "react";
import ChatPage from "./ChatComponenet";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [roomId, setroomId] = useState("");

  var socket: any;
  socket = io("http://localhost:3001");

  const handleJoin = () => {
    if (userName !== "" && roomId !== "") {
      socket.emit("join_room", roomId, userName);
      setShowSpinner(true);
      setTimeout(() => {
        setShowChat(true);
        setShowSpinner(false);
      }, 4000);
    } else {
      alert("Please fill in Username and Room Id");
    }
  };

  return (
    <div>
    <div
      className="flex flex-col items-center justify-center h-screen bg-gray-600"
      style={{ display: showChat ? "none" : "" }}
    >
      <input
        className="mb-4 p-2 border border-gray-300 rounded"
        type="text"
        placeholder="Username"
        onChange={(e) => setUserName(e.target.value)}
        disabled={showSpinner}
      />
      <input
        className="mb-4 p-2 border border-gray-300 rounded"
        type="text"
        placeholder="room id"
        onChange={(e) => setroomId(e.target.value)}
        disabled={showSpinner}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={() => handleJoin()}
      >
        {!showSpinner ? (
          "Join"
        ) : (
<div className="loader border-t-2 rounded-full border-gray-500 bg-gray-300 animate-spin
aspect-square w-8 flex justify-center items-center text-yellow-700"></div>        )}
      </button>
    </div>
    <div style={{ display: !showChat ? "none" : "" }}>
      <ChatPage socket={socket} roomId={roomId} username={userName} />
    </div>
  </div>
  );
}



