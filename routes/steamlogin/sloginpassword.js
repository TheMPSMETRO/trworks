const router = require('express').Router()
const SteamUser = require('steam-user');

router.post('/', async (req,res) => {
    try{
        
        const {login,password} = req.body

        console.log(req.body)

        const client = new SteamUser()

        client.logOn({
            accountName: login,
            password: password,
        })

        client.once('steamGuard', () => {
            res.status(201).json({
                success:true,
                message:'authenticationneeded',
                login,
                password
            })
        })

        
        client.once('error', (err) => {
            
            res.status(400).json({
                success: false,
                message: `Login failed: ${err.message}`
            });
        });



    }catch(error){
        console.log(error)
        res.status(500).json({
            success:false,
            message:'server error'
        })
    }
})


module.exports = router