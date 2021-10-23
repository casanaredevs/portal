export interface Developer {
    name: string;
    lastName: string;
    imageUrl?: string;
    socialNetworks?: SocialNetwork[]
    description?: string;
}

export interface SocialNetwork {
    url: string;
    name: SocialNetworks
}

export enum SocialNetworks {
    GITHUB = 'github',
    FACEBOOK = 'facebook',
    INSTAGRAM = 'instagram',
    LINKED_IN = 'linked_in',
    TELEGRAM = 'telegram',
    TWITTER = 'twitter',
    WHATSAPP = 'whatsapp',
}

