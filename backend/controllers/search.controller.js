const Field = require ('../models/field.model');
const SportCenter = require ('../models/sportCenter.model')
const { request, response} = require ('express');
const searchCtrl = {};


searchCtrl.search = async (req = request, res = response)=> {
    searchText = req.params.searchText;
    try {
        const [fields, sportCenters] = await Promise.all([
            Field.find({ name: new RegExp(searchText, 'i')}),
            SportCenter.find({ name: new RegExp(searchText, 'i')})
        ])
        res.json({
            ok:true,
            msg:'Found Search items',
            param: {
                fields,
                sportCenters
            }
        })
    } catch (error) {
        console.log(error);
        errorResponse(res);
    }
}
function errorResponse(res){
    res.status(500).json({
        ok:false,
        code: 99,
        msg:'An unexpected error occurred'
    })
}
module.exports = searchCtrl;
