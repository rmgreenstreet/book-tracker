// const { books } = require("googleapis/build/src/apis/books");

window.onload = function () {
    // formatTagCloud();
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    $('#tag-search').keypress(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });
};

function removeTagFromList(e) {
    /* Prevent checkbox from being unchecked by the click prior to being programattically unchecked, the two of which together would make it reverse */
    e.preventDefault();

    console.log('removing tag');
    let parentTag = this.closest('.tag');
    if(parentTag.classList.contains('popular-tag')){
        parentTag.querySelector('input').checked = false;
        parentTag.querySelector('input').setAttribute('checked', false);
        parentTag.querySelector('.tag-count').classList.remove('not-visible');
        parentTag.querySelector('.add-tag-plus').classList.remove('not-visible');
        this.classList.add('not-visible');
        document.querySelector('.popular-tags').appendChild(parentTag);
    } else if (parentTag.classList.contains('searched-tag') && document.querySelector('#tag-search').value) {
        parentTag.querySelector('input').checked = false;
        parentTag.querySelector('.add-tag-plus').classList.remove('not-visible');
        this.classList.add('not-visible');
        document.querySelector('#tag-search-results').appendChild(parentTag);
    } else {
        parentTag.remove();
    }
};

function addTagToList(e) {
    /* Prevent checkbox from being checked by the click prior to being programattically checked, the two of which together would make it reverse */
    e.preventDefault();

    let parentTag = this.closest('.tag');
    let duplicateTag = document.querySelector('.popular-tags').querySelector('#'+parentTag.querySelector('input').getAttribute('id'))
    if (duplicateTag && parentTag !== duplicateTag) {
        parentTag.remove();
        parentTag = duplicateTag;
    }
    document.querySelector('.applied-tags').appendChild(parentTag);
    parentTag.querySelector('.add-tag-plus').classList.add('not-visible');
    let tagCount = parentTag.querySelector('.tag-count');
    if (tagCount) {
        tagCount.classList.add('not-visible');
    }
    parentTag.querySelector('.remove-tag-x').classList.remove('not-visible');
    parentTag.querySelector('.tag-checkbox').checked = true;
    parentTag.querySelector('.tag-checkbox').setAttribute('checked','true');
}



let allXs = document.querySelectorAll('.remove-tag-x');

for (let x of allXs) {
    x.onclick = removeTagFromList;
}

let allPluses = document.querySelectorAll('.add-tag-plus');

for (let plus of allPluses) {
    plus.onclick = addTagToList;
}

const tagSearchBox = document.querySelector('#tag-search');

let timeout = null;
if (tagSearchBox) {
    tagSearchBox.addEventListener('input', function () {
        let that = this;
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(async function () {
            let results = await doSearch('tags', that.value);
            let tagSearchResults = document.querySelector('#tag-search-results');
            listTagResults(results, tagSearchResults);
        }, 200);
    });
}

const bookSearchBox = document.querySelector('#book-search');

if(bookSearchBox) {
    bookSearchBox.addEventListener('input', function () {
        let that = this;
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(async function () {
            let results = await doSearch('books', that.value);
            let bookSearchResults = document.querySelector('#book-search-results')
            listBookResults(results, bookSearchResults);
        }, 200);
    });
}

async function doSearch(type, value){
    const response = await axios.get(`/${type}/search/${value}`);
    return response.data;
}

function listTagResults(results, destination) {
    for (let child of destination.children) {
        destination.removeChild(child);
    }
    if (results.length > 0) {
        for (let result of results) {
            if (!document.querySelector('.applied-tags').querySelector(`#tag${result._id}`)) {
                let blankResult = document.querySelector('#quick-result').content.cloneNode(true);
                blankResult.querySelector('.tag').setAttribute('title', `${result.description.substr(0,20)}...`)
                blankResult.querySelector('.tag').setAttribute('id', `tag${result.id}`)
                
                let resultLabel = blankResult.querySelector('label');
                resultLabel.setAttribute('for', `tag${result._id}check`);
                resultLabel.prepend(`${result.title}`);

                let resultCheckBox = blankResult.querySelector('input');
                resultCheckBox.setAttribute('id', `tag${result._id}check`);
                resultCheckBox.setAttribute('value', `${result._id}`);

                blankResult.querySelector('.remove-tag-x').addEventListener('click', removeTagFromList);
                blankResult.querySelector('.add-tag-plus').addEventListener('click', addTagToList);

                destination.appendChild(blankResult);
            }
        }
    } else {
        const noResultsNode = document.createElement('p');
        noResultsNode.appendChild(document.createTextNode('No Results Found'));
        destination.appendChild(noResultsNode);
    }
}

function listBookResults(results, destination) {
    console.log(results);
    for (let child of destination.children) {
        destination.removeChild(child);
    }
    if (results.length > 0) {
        for (let result of results) {
            console.log(result);
            let blankResult = document.querySelector('#blank-book-result').content.cloneNode(true);
            blankResult.querySelector('.book-result').setAttribute('id', `${result._id}result`);
            blankResult.querySelector('.create-link')
            .setAttribute('id', `${result._id}link`)
            .setAttribute('href', `/reviews/new/${result._id}`);
            blankResult.querySelector('.result-image')
            .setAttribute('src', `${result.googleBook.volumeInfo.images.thumbnail}`)
            .setAttribute('alt', `${result.title}`)
            .setAttribute('id', `${result._id}thumbnail`);
            blankResult.querySelector('.result-book-title')
            .innerHTML = `${result.title}`;
            blankResult.querySelector('.result-book-author')
            .innerHTML = `${result.googleBook.volumeInfo.authors[0]}`;
            blankResult.querySelector('.result-book-description')
            .innerHTML = `${result.googleBook.volumeInfo.description.substr(0,50)}...`
            
            destination.appendChild(blankResult);
        }
    } else {
        const noResultsNode = document.createElement('p');
        noResultsNode.appendChild(document.createTextNode('No Results Found'));
        destination.appendChild(noResultsNode);
    }
}