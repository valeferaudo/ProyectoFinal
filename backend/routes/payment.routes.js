//RUTA: http:localhost:3000/api/payments'

const express = require ('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');

  
router.post("/create_preference", paymentCtrl.createPreference);
router.post("/mercado_pago",paymentCtrl.createMercadoPagoPayment)
router.put("/mercado_pago/:preferenceID",paymentCtrl.updateMercadoPagoPayment)
router.delete("/mercado_pago/:preferenceID",paymentCtrl.deleteMercadoPagoPayment)
router.get("/user/:userID",paymentCtrl.getUserPayments)
router.get("/sportCenter/:sportCenterID",paymentCtrl.getSportCenterPayments)
router.put("/sportCenter/mercado_pago/:paymentID",paymentCtrl.updateSportCenterMercadoPagoPayment)
router.delete("/sportCenter/mercado_pago/:paymentID",paymentCtrl.deleteSportCenterMercadoPagoPayment)
router.post("/sportCenter/:sportCenterID",paymentCtrl.createSportCenterPayment)

router.get("/", function (req, res) {
        res.status(200).sendFile("index.html");
});   
router.get('/feedback', function(request, response) {
       response.json({
          Payment: request.query.payment_id,
          Status: request.query.status,
          MerchantOrder: request.query.merchant_order_id
      })
  });

module.exports=router;