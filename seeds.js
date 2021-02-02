const Book = require('./models/book');
const Tag = require('./models/tag');
const Review = require('./models/review');
const User = require('./models/user');
const { 
    createBook,
    getGoogleBook
} = require('./controllers/books');
const axios = require('axios');
const faker = require('faker');
const moment = require('moment');

async function seedTags(devUser) {
    const defaultTags = require('./tmp/tags.json');
    for(let tag of defaultTags.defaultTags) {
        await Tag.create(tag);
    };
    console.log(`${defaultTags.defaultTags.length} default tags created`);
    return
};

async function seedBooks(devUser) {
    //Choose how many books to create between 50 and 100
    const numberOfBooks = Math.ceil(Math.random() * (100 - 50) + 50);
    console.log(`Creating ${numberOfBooks} Books`)
    for (let i = 1; i < numberOfBooks; i++) {
        const randomWord = faker.random.word();
        const googleBooks = await axios.get(
            'https://www.googleapis.com/books/v1/volumes?q=' + 
             randomWord + 
            '&orderBy=newest&key=' + 
            process.env.GOOGLE_BOOKS_API_KEY
        );
        const randomIndex = Math.floor(Math.random() * googleBooks.data.items.length);
        console.log(`creating book from result number ${randomIndex+1}`);
        const singleGoogleBook = googleBooks.data.items[randomIndex];
        await Book.create({
            title: singleGoogleBook.volumeInfo.title,
            googleBooksId: singleGoogleBook.id,
            createdBy: devUser._id
        });
        console.log(`Book number ${i} of ${numberOfBooks} created: ${singleGoogleBook.volumeInfo.title} from Faker seed ${randomWord}`);
    };
    return;
};

async function seedReviews(devUser) {
    //Choose how many reviews will be created between 300 and 1000
    const numberOfReviews = Math.floor(Math.random() * (1000-300) + 300);
    console.log(`Creating ${numberOfReviews} Reviews`);
    const allBooks = await Book.find({});
    const allTags = await Tag.find({});

    for (let i = 0; i < numberOfReviews; i++) {
        //pick a random book from the database to write a review about
        const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
        //pick a random number of tags to apply between 1 and 10
        const numberOfTags = Math.ceil(Math.random() * 10);
        let tagsCopy = [];
        for (let i = 0; i < allTags.length; i++) {
            tagsCopy.push(allTags[i]._id);
        };
        let randomTags = [];
        for (let j = 1; j <= numberOfTags; j++) {
            randomTags.push(
                tagsCopy.splice(Math.floor(Math.random() * tagsCopy.length), 1)
            )
        };
        
        const randomStartDate = faker.date.past();
        const wasBookFinished = Math.random() < 0.5 ? true : false;
        console.log(`Book finished: ${wasBookFinished}`);
        const randomFinishedDate = new Date(faker.date.between(moment(randomStartDate).format('YYYY[-]MM[-]DD'), moment(Date.now()).format('YYYY[-]MM[-]DD')));
        const newReview = new Review( {
            title: faker.lorem.words(5),
            author: devUser._id,
            book: randomBook._id,
            starRating: Math.ceil(Math.random() * 5),
            text: faker.lorem.paragraph(),
            tags: randomTags,
            created: randomStartDate,
            bookStartedDate: randomStartDate
        });
        if(wasBookFinished) {
            newReview.bookFinished = wasBookFinished;
            newReview.bookFinishedDate = randomFinishedDate;
        }
        await newReview.save();
        console.log(`${newReview.starRating} star review created for ${randomBook.title}`);
    };
    console.log(`${numberOfReviews} reviews created`);
};

async function seedDatabase() {
    const devUser = await User.findOne({username: 'bob'});
    await Book.deleteMany({});
    console.log('All Books removed');
    await Tag.deleteMany({});
    console.log('All Tags Removed');
    await Review.deleteMany({});
    console.log('All Reviews removed');

    await seedBooks(devUser);
    
    await seedTags(devUser);

    await seedReviews(devUser);
};

module.exports = seedDatabase;