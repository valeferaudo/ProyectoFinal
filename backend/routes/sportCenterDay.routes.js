/*
RUTA: http:localhost:3000/api/sportcenterDays
*/

const express = require ('express');
const router = express.Router();
const {check} = require ('express-validator')
const {validateFields} = require ('../middlewares/validateFields')
const sportCenterDayCtrl = require ('../controllers/sportCenterDay.controller');
const {validateJWT} = require('../middlewares/validateJWT');


router.get('/:id',[validateJWT],sportCenterDayCtrl.getSportCenterDays);
// router.get('/:id',[validateJWT],sportCenterCtrl.getSportCenter);
// router.post('/',[validateJWT,
//                 check('name','Name field is required').not().isEmpty(),
//                 check('address','Address field is required').not().isEmpty(),
//                 check('phone','Phone field is required').not().isEmpty(),
//                 validateFields],sportCenterCtrl.createSportCenter);
//  router.put('/:id',[validateJWT,
//                  check('name','Name field is required').not().isEmpty(),
//                  check('address','Address field is required').not().isEmpty(),
//                  check('phone','Phone field is required').not().isEmpty(),
//                  validateFields],sportCenterCtrl.updateSportCenter);
// router.put('/delete/:id',[validateJWT],sportCenterCtrl.deleteSportCenter);
// router.post('/:id/service/',[validateJWT,
//                             check('service','Service field is required').not().isEmpty(),
//                             validateFields],sportCenterCtrl.addService);
// router.put('/:id/service/:service',[validateJWT],sportCenterCtrl.updateService);
// router.delete('/:id/service/:service',[validateJWT],sportCenterCtrl.deleteService);
// router.put('/activate/:id',[validateJWT],sportCenterCtrl.activateUser);


module.exports = router;