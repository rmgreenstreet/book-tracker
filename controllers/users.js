const express = require('express');
const app = express();
const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const User = require('../models/user');
// const { roles } = require('../bin/roles');
// const { deleteProfileImage } = require('../middleware');
const crypto = require('crypto');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
if (app.get('env') == 'development'){ require('dotenv').config(); }

module.exports = {
    
    async getUsers (req, res, next) {
        const allUsers = await User.find({});
        res.render('users/allusers', {allUsers});
    },
    async getUser (req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId);
            if (!user) return next(new Error('User does not exist'));
             res.render('/users/profile', {user});
        } catch (error) {
            next(error);
        }
    },
    async updateUser (req, res, next) {
        try {
            const update = req.body;
            const userId = req.params.userId;
            await User.findByIdAndUpdate(userId, update);
            const user = await User.findById(userId);
            res.render('user/profile', {user});
        } catch (error) {
            next(error);
        }
    },
    async deleteUser (req, res, next) {
        try {
            const userId = req.params.userId;
            await User.findByIdAndDelete(userId);
            res.redirect('/users/allusers');
        } catch (error) {
            next(error);
        }
    },
    grantAccess (action, resource) {
        return async (req, res, next) => {
            try {
                const permission = roles.can(req.user.role)[action](resource);
                if (!permission.granted) {
                    return res.status(401).json({
                    error: "You don't have enough permission to perform this action"
                });
            }
                next();
            } catch (error) {
                next(error);
        }
        }
    }

}