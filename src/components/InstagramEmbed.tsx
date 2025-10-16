'use client'

import { useState, useEffect } from 'react'

interface InstagramEmbedProps {
  username: string
}

export default function InstagramEmbed({ username }: InstagramEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState('')

  useEffect(() => {
    // Detectar o domínio atual
    const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000'
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/profiles'
    
    // Construir a URL do embed do Instagram
    const url = `https://www.instagram.com/${username}/embed/?cr=1&v=14&wp=539&rd=${encodeURIComponent(currentDomain)}&rp=${encodeURIComponent(currentPath)}`
    setEmbedUrl(url)
  }, [username])

  return (
    <div className="relative w-full">
      {embedUrl && (
        <iframe
          className="instagram-media instagram-media-rendered"
          src={embedUrl}
          allowtransparency="true"
          allowFullScreen={true}
          frameBorder="0"
          height="623"
          scrolling="no"
          style={{
            backgroundColor: 'white',
            borderRadius: '3px',
            border: '1px solid rgb(219, 219, 219)',
            boxShadow: 'none',
            display: 'block',
            margin: '0px 0px 12px',
            minWidth: '326px',
            padding: '0px',
            width: '100%'
          }}
          title={`Instagram profile for ${username}`}
        />
      )}
    </div>
  )
}