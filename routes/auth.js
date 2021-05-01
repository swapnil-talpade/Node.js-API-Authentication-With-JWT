const router = require("express").Router();
const User = require("../model/User");
const { registerValidation, loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


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

// LOGIN
router.post('/login', async (req, res) => {
    // lets validate the data before we make a user
    const { error } = loginValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    // check if email exist
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send('Email is not found')

    // check if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Enter valid password');

    // create and assign token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
})


module.exports = router;


