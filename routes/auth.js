const router = require("express").Router();
const User = require("../model/User");
const { registerValidation } = require('../validation');
const bcrypt = require('bcryptjs');


// REGISTER
router.post("/register", async (req, res) => {

    // lets validate the data before we make a user
    const { error } = registerValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // check if user is already in db
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).send('Email already exists')

    // hash the passwords
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt);


    // create new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });
    try {

        const savedUser = await user.save();
        res.send({ user: user._id })
    } catch (error) {
        res.status(400).send(error)
    }


});


module.exports = router;


