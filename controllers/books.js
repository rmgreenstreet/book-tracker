const express = require('express');
const app = express();
if (app.get('env') == 'development'){ require('dotenv').config(); }

module.exports = {

    async createBook() {

    },
    async findBook() {

    },
    async updateBook() {

    },
    async deleteBook() {
        
    }

}