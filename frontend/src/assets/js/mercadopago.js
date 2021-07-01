const initMercadoPago = (publicKEY,preferenceID) => {
    const mp = new MercadoPago(publicKEY, {
        locale: 'es-AR'
    })
    const checkout = mp.checkout({
        preference: {
            id: preferenceID
        },
        autoOpen:true,
    });
    // checkout.render({
    //     container: '.cho',
    //     label: 'Pagar'
    // });
}