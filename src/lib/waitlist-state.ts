export const stateMap = {
    success: {
        tone: 'success',
        message: 'You are on the list. Thanks for the signal.',
    },
    invalid: {
        tone: 'error',
        message:
            'That submission could not be accepted. Please check the form and try again.',
    },
    rate_limited: {
        tone: 'error',
        message:
            'That form has seen too many recent attempts. Please wait a bit and try again.',
    },
    unavailable: {
        tone: 'error',
        message:
            'The waitlist is not ready yet. I still need a few deployment settings to finish the live flow.',
    },
    blocked: {
        tone: 'error',
        message: 'That submission looked automated, so it was not accepted.',
    },
    preview_disabled: {
        tone: 'info',
        message: 'Preview build only - submissions are disabled here.',
    },
} as const;

export function getWaitlistStatus(waitlistState: string | null) {
    return waitlistState && waitlistState in stateMap
        ? stateMap[waitlistState as keyof typeof stateMap]
        : null;
}
