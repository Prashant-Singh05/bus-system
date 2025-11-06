import React, { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapView({ items }) {
  useEffect(() => {
    const map = L.map('map', { center: [28.4595, 77.0266], zoom: 13 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const markers = []
    items.forEach(it => {
      if (it.latitude && it.longitude) {
        const m = L.marker([Number(it.latitude), Number(it.longitude)]).addTo(map)
        m.bindPopup(`Bus ${it.bus_no}<br/>${it.current_stop} → ${it.next_stop}`)
        markers.push(m)
      }
    })

    return () => { markers.forEach(m => m.remove()); map.remove() }
  }, [items])

  return <div id="map" className="w-full h-96 rounded border" />
}
