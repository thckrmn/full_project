const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const secretKey = "NoIdeaNow";

// ***
// * Verify token through Cookies of HttpOnly 
// ***
// const verifyToken = (req, res, next) => {
//     const token = req.cookies.authToken; // เปลี่ยนมาเช็คผ่าน cookie ที่ใส่ไปแทน
//     if (token == null) return res.sendStatus(401); // if there isn't any token

//     try {
//       const user = jwt.verify(token, secretKey);
//       req.user = user;
//       next();
//     } catch (error) {
//       return res.sendStatus(401);
//     }
// }
// ***
// * Verify token through Bearer of Http authorization header
// ***
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.sendStatus(401)
    }
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Failed to authenticate token' })
        }
        req.user = decoded;
        next();
    });
}

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.users.findUnique({
            where: { UserName: username },
        });
        if (!user) {
            res.status(404).json({ 'message': 'User not found!' });
        }
        const validPassword = await bcrypt.compare(password, user.Password);
        if (!validPassword) {
            return res.status(401).send({ message: "Invalid username or password!" });
        }
        const token = jwt.sign({ username: user.UserName, role: user.Role }, secretKey, { expiresIn: "4h" });
        // use with HTTPS only with SameSite only
        res.cookie("authToken", token, {
            maxAge: 1000 * 60 * 60 * 4,   // expired after 4 hours
            secure: false,  // not use with HTTPS only
            httpOnly: true,
            sameSite: "Strict",
        });
        // use with HTTPS only with SameSite is not strict
        // res.cookie("authToken", token, {
        //     maxAge: 1000 * 60 * 60 * 4,   // expired after 4 hours
        //     secure: true,  
        //     httpOnly: true,
        //     sameSite: "none",
        // });
        res.status(200).send({ message: "Login successful", id: user.UserID, role: user.Role, token: token });

    } catch (err) {
        res.status(500).json(err);
    }
}

// user logout
const logout = async (req, res) => {
    res.clearCookie('authToken', { path: '/' });
    res.send({ message: "Logout successful" });
}

module.exports = {
    login, logout, verifyToken, secretKey
}