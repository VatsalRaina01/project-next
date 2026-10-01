import { imageSizes } from '@/services/images/subservice/constants'

export type ImageSize = 'MICRO' | 'TINY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'HUGE'

export type ImageResolution = ImageSize | 'ORIGINAL'

/** Ascending by width. Matches the tiers the processing pipeline produces. */
const widthsBySize: [ImageSize, number][] = [
    ['MICRO', imageSizes.micro],
    ['TINY', imageSizes.tiny],
    ['SMALL', imageSizes.small],
    ['MEDIUM', imageSizes.medium],
    ['LARGE', imageSizes.large],
    ['HUGE', imageSizes.huge],
]

/**
 * Picks the smallest stored resolution that is at least as wide as the requested display width.
 * This keeps the browser from upscaling the image, which would look blurry.
 * Falls back to the largest tier once the display width exceeds every stored size.
 * Ignores device pixel ratio. Retina screens may get an undersized match.
 */
export function resolutionForWidth(width: number): ImageSize {
    const size = widthsBySize.find(([, sizeWidth]) => sizeWidth >= width)
    return size ? size[0] : 'HUGE'
}
