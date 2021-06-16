export interface CurrentWeather{
    main?: {
        feels_like?: any,
        humidity?: any,
        pressure?: any,
        temp?: any,
        temp_max?:any,
        temp_min?:any,
    },
    clouds?: {
        all?: any
    },
    weather?: [{
        description?: any,
        icon?: any,
        id?: any,
        main?: any,
    }],
    wind?: {
        deg?: any,
        gust?: any,
        speed?: any
    }
}
