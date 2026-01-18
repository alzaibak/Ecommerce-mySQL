const jsonWebToken = require("jsonwebtoken");

// token verification function
const tokenVerification = (req, res, next) => {
    const authHeader = req.headers.token;

    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jsonWebToken.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) return res.status(403).json("Wrong token");
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("You are not authenticated");
    }
};

// user token with id verification before updating the personal info
const tokenVerificationAndAuthorization = (req, res, next) => {
    tokenVerification(req, res, () => {
        if (req.user.id === parseInt(req.params.id) || req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not allowed to do that");
        }
    });
};

// admin token verification before adding or deleting products
const tokenVerificationAndAdmin = (req, res, next) => {
    tokenVerification(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not admin");
        }
    });
};


module.exports = { tokenVerification, tokenVerificationAndAuthorization, tokenVerificationAndAdmin };
