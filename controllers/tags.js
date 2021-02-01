const express = require('express');
const app = express();
// const axios = require('axios').default;
if (app.get('env') == 'development'){ require('dotenv').config(); }
const Tag = require('../models/tag');


module.exports = {

    async getAllTags(req, res, next) {
        try {
            const allTags = await Tag.find({});
            return res.render('tags/all-tags', {title: 'All Tags', allTags: allTags});
        } catch (err) {
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async createTag(req, res, next) {
        try {

            let newTag = await Tag.create({
                title: req.body.title,
                author: req.user.id,
                description: req.body.description
            });
            res.redirect('/tags');
        } catch (err) {
            console.error(err.message);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async findTag(req, res, next) {
        try {
            //Find tag in database
            const currentTag = await Tag.findOne({id: req.params.tagId, active:true});

            res.render('/tags/tag-details', {currentTag});
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async updateTag(req, res, next) {
        try {
            //Find tag in database, then update it
            const currentTag = await Tag.findOneAndUpdate({id: req.params.tagId}, req.body);
            req.session.success = 'Tag Information Updated!';
            res.redirect('/tags');
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/tags');
        }
    },
    async unPublishTag(req, res, next) {
        try {
            //Find tag in database, then update it with active: false 
            const currentTag = await Tag.findOneAndUpdate({id: req.params.tagId}, {active: false});
            req.session.success = 'The Tag Has Been Unpublished!';
            res.redirect('/tags');
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async deleteTag(req, res, next) {
        try {
            //Find tag in database and delete it 
            const currentTag = await Tag.findOneAndRemove({id: req.params.tagId});
            req.session.success = 'The Tag Has Been Deleted!';
            res.redirect('/tags');
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    }

}