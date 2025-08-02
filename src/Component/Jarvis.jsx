import React, { useEffect } from "react";
import "./style.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

const Jarvis = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;

  useEffect(() => {
    speak("Initializing Jarvis...", () => {
      setTimeout(wish, 1000);
    });
  }, []);

  const activate = () => {
    speak("Jarvis activated, I'm listening...", () => {
      listen();
    });
  };

  const listen = () => {
    recognition.start();

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      console.log("🎤 Heard:", text);

      const opened = openApp(text);
      if (!opened) await gemini(text);
    };

    recognition.onerror = (e) => {
      console.error("Recognition error:", e.error);
      speak("Sorry, I couldn't understand.");
    };
  };

  const speak = (text, callback) => {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      utterance.voice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("alex") ||
          v.name.toLowerCase().includes("male")
        ) || voices[0];

      if (callback) utterance.onend = callback;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
      setVoiceAndSpeak();
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  const openApp = (prompt) => {
    const apps = {
      google: "https://www.google.com",
      youtube: "https://www.youtube.com",
      gmail: "https://mail.google.com",
      linkedin: "https://www.linkedin.com",
      github: "https://github.com"
    };

    for (const key in apps) {
      if (prompt.includes(key)) {
        speak(`Opening ${key}`);
        window.open(apps[key], "_blank");
        return true;
      }
    }
    return false;
  };

  const wish = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      speak("Good morning sir. How can I assist you today?", listen);
    } else if (hour < 18) {
      speak("Good afternoon sir. How can I help?", listen);
    } else {
      speak("Good evening sir. What can I do for you?", listen);
    }
  };

 const gemini = async (prompt) => {
  
  try {
    const result=await fetch("http://localhost:5000/chat",{
      method:"POST",
      headers:{
        "content-type":"application/json"
      },
      body:JSON.stringify({prompt})
    })
    const data=await result.json();
    const responseText =data.response;
    console.log("🤖 Gemini:", responseText);

    // Trim long responses
    const maxChars = 300;
    let trimmed = responseText;

    if (responseText.length > maxChars) {
      // Try sentence-based trimming
      const sentences = responseText.split(".");
      trimmed = "";
      for (let sentence of sentences) {
        if ((trimmed + sentence).length < maxChars) {
          trimmed += sentence.trim() + ". ";
        } else break;
      }
    }

    speak(trimmed.trim(), listen);
  } catch (error) {
    console.error("Gemini error:", error);
    speak("Sorry, I couldn't understand that.", listen);
  }
};


  return (
    <div className="jarvis-container">
      <h2 className="jarvis-heading">🎙️ Jarvis AI Assistant</h2>
      <img
        className="jarvis-image"
        src="https://i.pinimg.com/originals/d9/09/57/d90957d7462b87ba8171fce62d2bf816.gif"
        alt="Jarvis animation"
        width={300}
        height={250}
      />
      <br />
      <button className="jarvis-button" onClick={activate}>Activate Jarvis</button>
      <button className="jarvis-button" onClick={stopSpeaking}>Stop Voice</button>
    </div>
  );
};

export default Jarvis;