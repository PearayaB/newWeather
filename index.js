const express = require("express"); 
const path = require("path");
const bcrypt = require("bcrypt"); //password insert to database
const dbConnection = require("./views/database");
const { body, validationResult } = require("express-validator"); // middleware check data to database
const session = require("express-session");
const app = express();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;


app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views")); //find path everywhere
app.set("view engine", "ejs");

//Middleware
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("home",{
      status:false
    });
  }
  next();
};

const ifLoggedin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.render("home",{
      status:true
    });
  }
  next();
};

app.get("/", ifNotLoggedin, (req, res, next) => {
  dbConnection
    .execute("SELECT `name` FROM `users` WHERE `id`=?", [req.session.userID])
    .then(([rows]) => {
      res.render("home", {
        // name: rows[0].name,
        
      });
    });
});

//register
app.post(
  "/register", //signup line14
  ifLoggedin,

  [
    body("user_email", "Invalid email address!")
      .isEmail()
      .custom((value) => {
        return dbConnection
          .execute("SELECT `email` FROM `users` WHERE `email`=?", [value])
          .then(([rows]) => {
            if (rows.length > 0) { 
              return Promise.reject("This E-mail already in use!");
            }
            return true;
          });
      }),
    body("user_name", "Username is Empty!").trim().not().isEmpty(),
    body("user_pass", "The password must be of minimum length 6 characters")
      .trim()
      .isLength({ min: 6 }),
  ], // end of post data validation
  (req, res, next) => {
    const validation_result = validationResult(req);
    const { user_name, user_pass, user_email } = req.body;

    if (validation_result.isEmpty()) { // not error
      bcrypt 
        .hash(user_pass, 12)
        .then((hash_pass) => {
          dbConnection
            .execute(
              "INSERT INTO `users`(`name`,`email`,`password`) VALUES(?,?,?)",
              [user_name, user_email, hash_pass]
            )
            .then((result) => {
              res.send(
                `your account has been created successfully, Now you can <a href="/">Login</a>`
              );
            })
            .catch((err) => {
              if (err) throw err;
            });
        })
        .catch((err) => {
          if (err) throw err;
        });
    } else {
      let allErrors = validation_result.errors.map((error) => {
        return error.msg;
      });

      res.render("signup", {
        register_error: allErrors,
        old_data: req.body,
      });
    }
  }
);

// LOGIN PAGE
app.get('/home',(req,res)=>{
  res.render('home',{
    status:true
  });
})

app.post(
  "/",
  ifLoggedin,
  [
    body("user_email").custom((value) => {
      return dbConnection
        .execute("SELECT email FROM users WHERE email=?", [value])
        .then(([rows]) => {
          if (rows.length == 1) {
            return true;
          }
          return Promise.reject("Invalid Email Address!");
        });
    }),
    body("user_pass", "Password is empty!").trim().not().isEmpty(),
  ],
  (req, res) => {
    const validation_result = validationResult(req);
    const { user_pass, user_email } = req.body;
    if (validation_result.isEmpty()) {
      dbConnection
        .execute("SELECT * FROM `users` WHERE `email`=?", [user_email])
        .then(([rows]) => {
          bcrypt
            .compare(user_pass, rows[0].password) //เปรียบเทียบรหัสที่รับมากับฐานข้อมูล
            .then((compare_result) => {
              if (compare_result === true) {
                req.session.isLoggedIn = true;
                req.session.userID = rows[0].id;

                res.redirect("/");
              } else {
                res.render("signup", {
                  login_errors: ["Invalid Password!"],
                });
              }
            })
            .catch((err) => {
              if (err) throw err;
            });
        })
        .catch((err) => {
          if (err) throw err;
        });
    } else {
      let allErrors = validation_result.errors.map((error) => {
        return error.msg;
      });
      res.render("signup", {
        login_errors: allErrors,
      });
    }
  }
);

// LOGOUT
app.get("/logout", (req, res) => {
  // req.session = null;
  res.redirect("/login");
});




authUser = (request, accessToken, refreshToken, profile, done) => {
  return done(null, profile);
};

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: "949425010900-hsg5sbmi22clvhefb4beg2jporg1kgnh.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    authUser
  )
);

passport.serializeUser((user, done) => {
  console.log(`\n--------> Serialize User:`);
  console.log(user);
  // The USER object is the "authenticated user" from the done() in authUser function.
  // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.

  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("\n--------- Deserialized User:");
  console.log(user);
  // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
  // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.

  done(null, user);
});


let count = 1;
showlogs = (req, res, next) => {
  console.log("\n==============================");
  console.log(`------------>  ${count++}`);

  console.log(`\n req.session.passport -------> `);
  console.log(req.session.passport);

  console.log(`\n req.user -------> `);
  console.log(req.user);

  console.log("\n Session and Cookie");
  console.log(`req.session.id -------> ${req.session.id}`);
  console.log(`req.session.cookie -------> `);
  console.log(req.session.cookie);

  console.log("===========================================\n");

  next();
};

app.use(showlogs);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/signup",
  })
);

//Define the Login Route
app.get("/login", (req, res) => {
  res.render("signup");
});

//Use the req.isAuthenticated() function to check if user is Authenticated
checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/signup");
};



app.listen(3000, () => console.log("Server is Running..."));
