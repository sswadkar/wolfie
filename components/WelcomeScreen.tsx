"use client"

import { useEffect, useState } from "react"
import { figtree } from "@/lib/fonts"

const examples = [
  "FDA regulations for medical devices",
  "drug approval processes",
  "clinical trial requirements",
  "regulatory compliance guidelines",
  "pharmaceutical manufacturing standards"
]

export const WelcomeScreen = () => {
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [exampleIndex, setExampleIndex] = useState(0)
  const [delta, setDelta] = useState(150)
  
  // Typing effect
  useEffect(() => {
    const ticker = setTimeout(() => {
      const current = examples[exampleIndex]
      
      if (isDeleting) {
        setCurrentText(current.substring(0, currentText.length - 1))
        setDelta(50) // Faster when deleting
      } else {
        setCurrentText(current.substring(0, currentText.length + 1))
        setDelta(100) // Slower when typing
      }
      
      if (!isDeleting && currentText === current) {
        // Start deleting after a pause
        setTimeout(() => setIsDeleting(true), 750)
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false)
        setExampleIndex((exampleIndex + 1) % examples.length)
        setDelta(500) // Pause before typing next example
      }
    }, delta)
    
    return () => clearTimeout(ticker)
  }, [currentText, delta, exampleIndex, isDeleting])
  
  return (
    <div className={`flex flex-col items-center justify-center h-full ${figtree.className}`}>
      <h1 className="text-5xl font-bold text-gray-600 z-10">
          Hey <span className="text-blue-800 font-bold">ARC Gen AI</span>
        </h1>
      <div className="h-8 mt-4">
        <p className="text-2xl text-gray-600">
          Ask me about <span className="text-blue-600 font-bold">{currentText}</span>
          <span className="animate-blink">|</span>
        </p>
      </div>
    </div>
  )
}
