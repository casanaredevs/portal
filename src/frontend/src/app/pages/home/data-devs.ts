import { Developer, SocialNetworks } from "./home.model";

export const developerList: Developer[] = [
    {
        name: 'Aldair',
        lastName: 'Guarupe',
        imageUrl: 'https://media-exp1.licdn.com/dms/image/C5603AQHLKrE4aOrdmw/profile-displayphoto-shrink_800_800/0/1618151074698?e=1639612800&v=beta&t=K89gw-Vt33Dl9hki4l8Q1q881DfILvdMdcYfkWypm6s',
        description: 'Desarrollador de Apps',
        socialNetworks: [
            {
                name: SocialNetworks.GITHUB,
                url: '//github.com/aldairguarupe'
            },
            {
                name: SocialNetworks.LINKED_IN,
                url: '//linkedin.com/in/aldairguarupe/'
            },
            {
                name: SocialNetworks.TWITTER,
                url: '//twitter.com/aldairguarupe'
            },
            {
                name: SocialNetworks.TELEGRAM,
                url: '//t.me/aldairguarupe'
            },
        ]
    },
    {
        name: 'Juan David',
        lastName: 'Pareja Soto',
        imageUrl: 'https://avatars.githubusercontent.com/u/3516716',
        description: 'Desarrollador de Software',
        socialNetworks: [
            {
                name: SocialNetworks.GITHUB,
                url: '//github.com/parejajd'
            },
            {
                name: SocialNetworks.LINKED_IN,
                url: '//linkedin.com/in/parejajd/'
            },
            {
                name: SocialNetworks.TWITTER,
                url: '//twitter.com/parejajd'
            },
            {
                name: SocialNetworks.FACEBOOK,
                url: '//facebook.com/parejajd'
            },
            {
                name: SocialNetworks.TELEGRAM,
                url: '//t.me/parejajd'
            },
        ]
    },
    {
        name: 'Wilfredo',
        lastName: 'Torres Ariza',
        imageUrl: 'https://avatars.githubusercontent.com/u/1329064',
        description: 'Desarrollador de Software',
        socialNetworks: [
            {
                name: SocialNetworks.GITHUB,
                url: '//github.com/torreswil'
            },
            {
                name: SocialNetworks.LINKED_IN,
                url: '//linkedin.com/in/torreswil/'
            },
            {
                name: SocialNetworks.FACEBOOK,
                url: '//facebook.com/wilfredotorresariza'
            }
        ]
    }
]

