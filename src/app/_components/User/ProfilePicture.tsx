import styles from './ProfilePicture.module.scss'
import Image from '@/components/Image/Image'
import type { ExpandedImage } from '@/services/images/subservice/types'

type PropTypes = {
    profileImage: ExpandedImage,
    width: number,
    className?: string
}

export default function ProfilePicture({ profileImage, width, className }: PropTypes) {
    const isStandardProfileImage = profileImage.standardImage === 'DEFAULT_PROFILE_IMAGE'

    return (
        <div className={styles.ProfilePicture}>
            <Image
                className={`${styles.image} ${isStandardProfileImage ? styles.standardImage : ''} ${className ?? ''}`}
                image={profileImage}
                width={width}
            />
        </div>
    )
}
