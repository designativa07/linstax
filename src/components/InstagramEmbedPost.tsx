'use client'

import { useEffect, useState } from 'react'

interface InstagramEmbedProps {
  embedCode: string
}

export default function InstagramEmbedPost({ embedCode }: InstagramEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Função para carregar o script do Instagram
    const loadInstagramScript = () => {
      if (typeof window !== 'undefined' && !window.instgrm) {
        const script = document.createElement('script')
        script.async = true
        script.src = '//www.instagram.com/embed.js'
        script.onload = () => {
          setIsLoaded(true)
          // Força a renderização dos embeds
          if (window.instgrm && window.instgrm.Embeds) {
            window.instgrm.Embeds.process()
          }
        }
        document.head.appendChild(script)
      } else if (window.instgrm) {
        setIsLoaded(true)
        window.instgrm.Embeds.process()
      }
    }

    loadInstagramScript()

    // Cleanup
    return () => {
      // Remove o script se necessário
    }
  }, [])

  useEffect(() => {
    // Reprocessa os embeds quando o código muda
    if (isLoaded && embedCode && window.instgrm && window.instgrm.Embeds) {
      setTimeout(() => {
        window.instgrm.Embeds.process()
      }, 100)
    }
  }, [embedCode, isLoaded])

  if (!embedCode) {
    return null
  }

  return (
    <div className="instagram-embed-container">
      <div
        dangerouslySetInnerHTML={{ __html: embedCode }}
        className="instagram-embed"
      />
    </div>
  )
}

// Declaração global para TypeScript
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}
