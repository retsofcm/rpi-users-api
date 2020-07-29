const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const checkAuth = require('../auth/check-auth');

function connectToDb() {
    return new sqlite3.Database('db/users.db', err => {
        error(err);
    
        console.log('Connected to the database')
    });
}

function closeDb(db) {
    db.close(err => {
        error(err);

        console.log('Close the database connection.');
    });
}

function error(err) {
    if (err) return res.status(500).json({ error: err });
}

router.get('/', (req, res, next) => {
    let db = connectToDb();

    db.all(`SELECT * FROM users`, (err, users) => {
        if (err) {
            res.status(500).json({
                error: err
            })
        } else {
            res.status(200).json({
                message: 'GET all users',
                users: users
            })
        }
    });

    closeDb(db);
});

router.post('/', (req, res, next) => {
    const db = connectToDb();
    const validateEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let _id = Math.random().toString(36).substr(2, 9);
    
    if (!validateEmail.test(String(req.body.email).toLowerCase())) {
        return res.status(500).json({ message: 'Email not valid' });
    }

    db.all(`SELECT * FROM users`, (err, users) => {
        if (users.find(user => user.email.toLowerCase() === req.body.email.toLowerCase())) {
            return res.status(409).json({ message: 'Email exists' });
        }
    
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                console.log(err)
                return res.status(401).json({
                    message: 'Auth failed'
                });
            } else {    
                const user = {
                    email: req.body.email,
                    password: hash,
                    _id: _id
                };

                db.run(`INSERT INTO users (email, password, id) VALUES(?, ?, ?)`, [user.email, user.password, user._id],  err => {
                    if (err) {
                        res.status(500).json({
                            error: err
                        })
                    } else {
                        res.status(201).json({
                            message: 'User created',
                            createdUser: user
                        })
                    }
                });

                closeDb(db);
            }
        });
    });
});

router.get('/:user', (req, res, next) => {
    const db = connectToDb();
    
    db.all(`SELECT * FROM users`, (err, users) => {
        const userId = req.params.user;
        const userExists = users.find(user => user.id === userId)

        if (userExists === undefined) return res.status(404).json({ message: 'User not found' });
        
        users.find(user => {
            if (userId === user.id) {
                if (err) {
                    res.status(500).json({
                        error: err
                    })
                } else {
                    const token = jwt.sign(
                        {
                            email: user.email,
                            userId: user._id
                        }, 
                        process.env.JWT_KEY, 
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token,
                        user: user
                    });
                }
            }
        });
    });

    closeDb(db);
});

router.patch('/:user', (req, res, next) => {
    const db = connectToDb();
    const userId = req.params.user;
    const validateEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    

    db.all(`SELECT * FROM users`, (err, users) => {
        let userExists = users.find(user => user.id === userId);

        if (userExists === undefined) return res.status(404).json({ message: 'User not found' });

        const updatedData = {};
        
        for (const data of req.body) {
            updatedData[data.propName] = data.value;
        }

        const updateUser = () => {
            userExists = Object.assign(userExists, updatedData);

            console.log(Object.values(updatedData))

            db.all(`UPDATE users SET ${Object.keys(updatedData)} = (?) WHERE id = (?)`, [Object.values(updatedData), userId], err => {
                if (err) {
                    res.status(500).json({
                        error: err
                    })
                } else {
                    res.status(200).json({
                        message: 'User updated',
                        user: userExists
                    })
                }
            });

            closeDb(db);
            return;
        }

        // TODO: Allow multiple updates in one request

        if (String(Object.keys(updatedData)) === "email") {
            if (!validateEmail.test(String(Object.values(updatedData)).toLowerCase())) {
                return res.status(500).json({ message: 'Email not valid' });
            }

            if (users.find(user => user.email.toLowerCase() === String(Object.values(updatedData)).toLowerCase())) {
                return res.status(409).json({ message: 'Email exists' });
            }
        }

        if (String(Object.keys(updatedData)) === "password") {
            bcrypt.hash(String(Object.values(updatedData)), 10, (err, hash) => {
                if (err) {
                    console.log(err)
                    return res.status(401).json({
                        message: 'Auth failed'
                    });
                } else {
                    updatedData.password = hash;
                    updateUser();
                }
            });
        } else {
            updateUser();
        }
        
        if (err) {
            res.status(500).json({
                error: err
            })
        }
    });
});

router.delete('/:user', checkAuth, (req, res, next) => {
    let db = connectToDb();

    const user = req.params.user;

    db.all(`SELECT * FROM users`, (err, users) => {
        const userId = req.params.user;
        const userExists = users.find(user => user.id === userId)

        if (userExists === undefined) return res.status(404).json({ message: 'User not found' });

        db.all(`DELETE FROM users WHERE id = (?)`, user, err => {
            if (err) {
                res.status(500).json({
                    error: err
                })
            } else {
                res.status(200).json({
                    message: 'User deleted'
                })
            }
        });

        closeDb(db);
    });
});

module.exports = router;