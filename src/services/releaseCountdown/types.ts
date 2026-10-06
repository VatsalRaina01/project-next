export type ReleaseCountdownSettings = {
    releaseDate: Date,
    /**
     * Whether anyone may walk past the countdown (with the button that appears once the git graph
     * has played), rather than only those who know the password.
     */
    openToAll: boolean,
}
