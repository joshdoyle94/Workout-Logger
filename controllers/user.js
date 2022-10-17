////////////////////////////////////////////
// Import Dependencies
////////////////////////////////////////////
const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

////////////////////////////////////////////
// Create router
////////////////////////////////////////////
const router = express.Router()


// Routes

// GET to render the signup form
router.get('/signup', (req, res) => {
	res.render('auth/signup')
})

// POST to send the signup info
router.post('/signup', async (req, res) => {
	// set the password to hashed password
  req.body.password = await bcrypt.hash(
		req.body.password,
		await bcrypt.genSalt(10)
	)
	// create a new user
	User.create(req.body)
		// if created successfully redirect to login
		.then((user) => {
			// res.redirect('/auth/login')
			console.log(user)
			res.status(201).json({ username: user.username })
		})
		// if an error occurs, send err
		.catch((err) => {
			console.log(err)
			res.json(err)
		})
})

// two login routes
// get to render the login form
// router.get('/login', (req, res) => {
// 	res.render('auth/login')
// })
// post to send the login info(and create a session)
router.post('/login', async (req, res) => {
	// console.log('request object', req)
	// get the data from the request body
	console.log('req.body', req.body);
	
	const { username, password } = req.body
	// then we search for the user
	User.findOne({ username: username })
		.then(async (user) => {
			// check if the user exists
			if (user) {
				// compare the password
				// bcrypt.compare evaluates to a truthy or a falsy value
				const result = await bcrypt.compare(password, user.password)

				if (result) {
					console.log('the user', user);
					
					// store some properties in the session
					req.session.username = user.username
					req.session.loggedIn = true
					req.session.userId = user.id

          			const { username, loggedIn, userId } = req.session

					console.log('session user id', req.session.userId)
					// redirect to /examples if login is successful
					res.status(201).json({ user: user.toObject() })
				} else {
					// send an error if the password doesnt match
					res.json({ error: 'username or password incorrect' })
				}
			} else {
				// send an error if the user doesnt exist
				res.json({ error: 'user does not exist' })
			}
		})
		// catch any other errors that occur
		.catch((error) => {
			console.log('the error', error);
			
			res.json(err)
		})
})

// // logout route -> destroy the session
router.delete('/logout', (req, res) => {
	req.session.destroy(() => {
		res.sendStatus(204)
	})
})

// // Export the Router
module.exports = router
