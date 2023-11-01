import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books


/**
 * Object that stores html elements to allow for easier readability and so as not to repeatedly query html elements throughout the code.
 * If an element's ID or structure changes, you only need to update it in this object.
 */
const data = {
    header: {
        search: document.querySelector('[data-header-search]'),
        settings: document.querySelector('[data-header-settings]'),
    },
    list: {
        items: document.querySelector('[data-list-items]'),
        message: document.querySelector('[data-list-message]'),
        button: document.querySelector('[data-list-button]'),
        active: document.querySelector('[data-list-active]'),
        blur: document.querySelector('[data-list-blur]'),
        image: document.querySelector('[data-list-image]'),
        title: document.querySelector('[data-list-title]'),
        subtitle: document.querySelector('[data-list-subtitle]'),
        description: document.querySelector('[data-list-description]'),
        close: document.querySelector('[data-list-close]'),
    },
    search: {
        overlay: document.querySelector('[data-search-overlay]'),
        form: document.querySelector('[data-search-form]'),
        title: document.querySelector('[data-search-title]'),
        genres: document.querySelector('[data-search-genres]'),
        authors: document.querySelector('[data-search-authors]'),
        cancel: document.querySelector('[data-search-cancel]'),
    },
    settings: {
        overlay: document.querySelector('[data-settings-overlay]'),
        form: document.querySelector('[data-settings-form]'),
        theme: document.querySelector('[data-settings-theme]'),
        cancel: document.querySelector('[data-settings-cancel]')
    }
}

const starting = document.createDocumentFragment()

for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
    const element = document.createElement('button')
    element.classList = 'preview'
    element.setAttribute('data-preview', id)

    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `

    starting.appendChild(element)
}

data.list.items.appendChild(starting)

const genreHtml = document.createDocumentFragment()
const firstGenreElement = document.createElement('option')
firstGenreElement.value = 'any'
firstGenreElement.innerText = 'All Genres'
genreHtml.appendChild(firstGenreElement)

/**
 * Loops through genres object and creates options for each genre then adds it to the genre list.
 */
for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    genreHtml.appendChild(element)
}

data.search.genres.appendChild(genreHtml)


const authorsHtml = document.createDocumentFragment()
const firstAuthorElement = document.createElement('option')
firstAuthorElement.value = 'any'
firstAuthorElement.innerText = 'All Authors'
authorsHtml.appendChild(firstAuthorElement)

/**
 * Loops through authors object and creates options for each author then adds it to the author list.
 */
for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    authorsHtml.appendChild(element)
}

data.search.authors.appendChild(authorsHtml)


/**
 * Object containing the color values of the text and background for the day theme.
 */
const dayTheme = {
        text: '10, 10, 20',
        background: '255, 255, 255'
    }

/**
 * Object containing the color values of the text and background for the night theme.
 */
const nightTheme = {
        text: '10, 10, 20', 
        background: '255, 255, 255'
    }


if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    data.settings.theme.value = 'night'
    document.documentElement.style.setProperty('--color-dark', nightTheme.background);
    document.documentElement.style.setProperty('--color-light', nightTheme.text);
} else {
    data.settings.theme.value = 'day'
    document.documentElement.style.setProperty('--color-dark', dayTheme.text);
    document.documentElement.style.setProperty('--color-light', dayTheme.background);
}

data.list.button.innerText = `Show more (${books.length - BOOKS_PER_PAGE})`
data.list.button.disabled = (matches.length - (page * BOOKS_PER_PAGE)) > 0

data.list.button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
`

/**
 * Closes the search overlay without implementing search criteria.
 */
const cancelSearch = () => {
    data.search.overlay.open = false
}
data.search.cancel.addEventListener('click', cancelSearch)


/**
 * Closes the settings overlay without changing the theme.
 */
const cancelSettings = () => {
    data.settings.overlay.open = false
}
data.settings.cancel.addEventListener('click', cancelSettings)


/**
 * Opens search overlay where you can search for specific book criteria.
 */
const openSearchOverlay = () =>{
    data.search.overlay.open = true 
    data.search.title.focus()
}
data.header.search.addEventListener('click', openSearchOverlay)


/**
 * Opens settings overlay where you can toggle between light and dark themes.
 */
const openSettingsOverlay = () => {
    data.settings.overlay.open = true 
}
data.header.settings.addEventListener('click', openSettingsOverlay)


/**
 * Closes book overlay.
 */
const closeBookOverlay = () => {
    data.list.active.open = false
}
data.list.close.addEventListener('click', closeBookOverlay)


/**
 * Changes the theme of the webpage to the user's chosen theme when submit is pressed.
 */
const submitSettings = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', nightTheme.background);
        document.documentElement.style.setProperty('--color-light', nightTheme.text);
    } else {
        document.documentElement.style.setProperty('--color-dark', dayTheme.text);
        document.documentElement.style.setProperty('--color-light', dayTheme.background);
    }
    
    data.settings.overlay.open = false
}
data.settings.form.addEventListener('submit', submitSettings)


/**
 * Searches for specific criteria given by the user, eg. author, and creates the html for all books that share that author.
 */
const searchBooks = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        data.list.message.classList.add('list__message_show')
    } else {
        data.list.message.classList.remove('list__message_show')
    }

    data.list.items.innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element)
    }

    data.list.items.appendChild(newItems)
    data.list.button.disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    data.list.button.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    data.search.overlay.open = false
}
data.search.form.addEventListener('submit', searchBooks)


/**
 * When the button at the bottom of the page is clicked, it displays the next set of 36 books.
 */
const showMoreButton = () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    data.list.items.appendChild(fragment)
    page += 1
}
data.list.button.addEventListener('click', showMoreButton)


/**
 * Shows an overlay of the selected book containing further information of the book including the publishing date and description.
 */
const openBookOverlay = () => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        data.list.active.open = true
        data.list.blur.src = active.image
        data.list.image.src = active.image
        data.list.title.innerText = active.title
        data.list.subtitle.innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        data.list.description.innerText = active.description
    }
}
data.list.items.addEventListener('click', openBookOverlay)