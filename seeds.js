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

async function seedUsers() {
    //Choose how many users to create between 50 and 100
    const numberOfUsers = Math.ceil(Math.random() * (100 - 50) + 50);
    console.log(`Creating ${numberOfUsers} users`);

        
    for (let i = 0; i < numberOfUsers; i++) {
        try {
            const firstLast = faker.name.firstName() + faker.name.lastName();
            const randomUser = {
                username: firstLast,
                email: firstLast + '@mail.com'
            }
            const newUser = await User.register(randomUser, 'password');
            console.log(`New User ${randomUser.username} created`)
        } catch (err) {
            if(err.message.includes('already registered')) {
                continue;
            }
        }
    };
    try {
        const devUser = await User.register({
            username: 'bob',
            email: 'bob@bob.com',
            role: 'owner'
        }, 'password');
    } catch (err) {
        console.error(err.message);
    }
    console.log(`${numberOfUsers} Users created!`);
    return;    
}

async function seedTags() {
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
    console.log(`Creating ${numberOfBooks} Books`);
    for (let i = 1; i < numberOfBooks; i++) {
        //pick a search term to use with google books API
        const randomWord = faker.random.word();
        const googleBooks = await axios.get(
            'https://www.googleapis.com/books/v1/volumes?q=' + 
             randomWord + 
            '&orderBy=newest&filter=ebooks&key=' + 
            process.env.GOOGLE_BOOKS_API_KEY
        );
        //Pick a random book from the google books results to add to the database
        const randomBookIndex = Math.floor(Math.random() * googleBooks.data.items.length);
        console.log(`creating book from result number ${randomBookIndex+1}`);
        const singleGoogleBook = googleBooks.data.items[randomBookIndex];

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
    const numberOfReviews = Math.floor(Math.random() * (1000-5000) + 5000);
    console.log(`Creating ${numberOfReviews} Reviews`);
    const allBooks = await Book.find({});
    const allTags = await Tag.find({});
    const allUsers = await User.find({});

    for (let i = 0; i < numberOfReviews; i++) {
        //pick a random user to be the author of the review
        const randomUserIndex = Math.floor(Math.random() * allUsers.length);
        //pick a random book from the database to write a review about
        const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
        //pick a random number of tags to apply between 1 and 10
        const numberOfTags = Math.ceil(Math.random() * 10);
        //Make a copy of the tags array
        let tagsCopy = [];
        for (let i = 0; i < allTags.length; i++) {
            tagsCopy.push(allTags[i]._id);
        };
        /* pick numberOfTags tags from tagsCopy, removing that option after the choice 
        from tagsCopy afterward to prevent duplicate tags on the same review, and 
        push them into randomTags to apply to the review */
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
            author: allUsers[randomUserIndex]._id,
            book: randomBook._id,
            starRating: Math.ceil(Math.random() * 5),
            text: faker.lorem.paragraph(),
            tags: randomTags,
            created: randomStartDate,
            bookStartedDate: randomStartDate
        });
        //If book was read all the way through, pick a random date this was done, between start date and current date
        if(wasBookFinished) {
            newReview.bookFinished = wasBookFinished;
            newReview.bookFinishedDate = randomFinishedDate;
        } else if (Math.random() < 0.5 ? true : false) {
            newReview.bookFinishedDate = randomFinishedDate;
        }
        if (i < 50) {
            newReview.author = devUser._id;
        }
        await newReview.save();
        console.log(`${newReview.starRating} star review created for ${randomBook.title}`);
    };
    console.log(`${numberOfReviews} reviews created`);
    return;
};

async function seedDatabase() {
    await User.deleteMany({role: {$not: /owner/}});
    console.log('All non-owner users deleted')
    const devUser = await User.findOne({username: 'bob'});
    await Book.deleteMany({});
    console.log('All Books removed');
    await Tag.deleteMany({});
    console.log('All Tags Removed');
    await Review.deleteMany({});
    console.log('All Reviews removed');

    await seedUsers();

    await seedBooks(devUser);
    
    await seedTags(devUser);

    await seedReviews(devUser);
};

module.exports = seedDatabase;