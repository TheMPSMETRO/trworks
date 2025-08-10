const router = require('express').Router()
const JWTmiddle = require('../middlewares/JWT.js')




router.get('/', JWTmiddle, async(req,res) => {
    try{
        const user = req.user
        console.log('user:',user.dbData.tradelink)
        res.render('userspage/user', {
            userID: user.userid,
            ProfilePicture:user.dbData.pictureurl,
            name:user.dbData.steamname,
            inventory:user.dbData.inventory,
            title: `tradeworks || ${user.dbData.steamname}`,
            message: 'Please login with your Steam account',
            tradelink:user.dbData.tradelink
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'server error'
        })
    }
})




router.get('/trades', JWTmiddle, async(req,res) => {
    try{
        const user = req.user

        console.log(user.dbData)
        console.log('user:',user.dbData.tradelink)
        res.render('tradingpage/tradingsite', {
            userID: user.userid,
            ProfilePicture:user.dbData.pictureurl,
            name:user.dbData.steamname,
            inventory:user.dbData.inventory,
            title: `tradeworks || ${user.dbData.steamname}`,
            message: 'Please login with your Steam account',
            tradelink:user.dbData.tradelink,
            deposited:user.dbData.deposited_items
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'server error'
        })
    }
})

module.exports = router