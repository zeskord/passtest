const express = require('express')
var session = require('express-session')
const path = require('path')
const fs = require('fs')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const app = express()
app.set('json spaces', 2)
app.use(express.json())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const googleSecret = JSON.parse(fs.readFileSync('./googleSecret.json', "utf8"))

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const users = [] // Массив пользователей

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: googleSecret.clientID,
    clientSecret: googleSecret.clientSecret,
    callbackURL: "http://zeskord.site/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        //console.log(profile)
        var user = {
            id: profile.id,
            accessToken: accessToken,
            refreshToken: refreshToken
        }

        //foundUser = users.find(u => u.id === user.id)

        return done(null, user)
        // Вот тут надо по-другому.
        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return done(err, user)
        // })
    }
))

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', checkAuthentication, function (req, res) {
    //console.log(req)
    res.render("index", {})
})

function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        next();
    } else{
        res.redirect("/auth/google")
    }
}

app.get('/logout', function (req, res) {
    req.logout()
    res.redirect('/')
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
)

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        //console.log("Успешно!")
        res.redirect('/')
    })


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(80)