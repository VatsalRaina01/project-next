'use client'

import Map from '@/components/Map/Map'
import { getMazeMapUrls } from '@/lib/maps/mazeMap'
import type { MapProps } from '@/components/Map/Map'
import type { MazeMapLocation } from '@/lib/maps/mazeMap'

export default function MazeMap({ height, ...location }: MapProps & MazeMapLocation) {
    const urls = getMazeMapUrls(location)
    return <Map key={urls.src} height={height} {...urls} title="MazeMap" invertColors />
}

/** Create a map component for a fixed location. */
export function MazeMapConstructor(location: MazeMapLocation) {
    return function FixedMazeMap({ height }: MapProps) {
        return <MazeMap height={height} {...location} />
    }
}

export const MazeMapLophtet = MazeMapConstructor({
    campusId: 1,
    zLevel: -1,
    center: { x: 10.402228, y: 63.418368 },
    zoom: 18,
    sharePoi: 83,
})
