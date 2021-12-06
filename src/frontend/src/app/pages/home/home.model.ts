export interface Developer {
    name: string;
    lastName: string;
    imageUrl?: string;
    socialNetworks?: SocialNetwork[]
    description?: string;
    technologies?: Technologies[]
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

export enum Technologies {
    PYTHON = 'python',
    JAVA = 'java',
    NET = 'net',
    JAVASCRIPT = 'javascript',
    C_SHARP = 'c_sharp',
    PHP = 'php',
    C_C_PLUSPLUS = 'c_c_plusplus',
    TYPESCRIPT = 'typescript',
    NODEJS = 'nodejs',
    DART = 'dart',
    SWIFT = 'swift',
    OBJECTIVE_C = 'objective_c',
    DJANGO = 'django',
    SPRING = 'spring',
    LARAVEL = 'laravel',
    REACT = 'react',
    ANGULAR = 'angular',
    BLAZOR = 'blazor',
    VUEJS = 'vuejs',
    NESTJS = 'nestjs',
    ADONISJS = 'adonisjs',
    FLUTTER = 'flutter',
    IONIC = 'ionic',
    A_FRAME = 'a_frame'
}
