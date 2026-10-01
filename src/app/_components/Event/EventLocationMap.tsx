'use client'

import MazeMap from '@/components/MazeMap/MazeMap'
import Map from '@/components/Map/Map'
import { getOpenStreetMapUrls, readLocationMap } from '@/lib/maps/locationMap'
import { parseMazeMapUrl } from '@/lib/maps/mazeMap'

export default function EventLocationMap({ locationMap, height = '350px' }: {
    locationMap: unknown,
    height?: string,
}) {
    const location = readLocationMap(locationMap)
    if (!location) return null
    if (location.provider === 'OPENSTREETMAP') {
        const urls = getOpenStreetMapUrls(location)
        return <Map key={urls.src} height={height} {...urls} title="OpenStreetMap" />
    }
    const mazeMapLocation = parseMazeMapUrl(location.url)
    return mazeMapLocation ? <MazeMap height={height} {...mazeMapLocation} /> : null
}
