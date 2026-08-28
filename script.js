const movieinp = document.querySelector("#movieinp");
const movieresults = document.querySelector("#movieresults");
const mywatchlist = document.querySelector("#mywatchlist");
const movieform = document.querySelector("#movieform");
const movieDetails = document.querySelector("#movieDetails");
const modalContent = document.querySelector("#modalContent");

let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

function renderWatchlist() {
    mywatchlist.innerHTML = "";
    if (watchlist.length === 0) {
        return;
    }
    watchlist.forEach((movie) => {
        mywatchlist.innerHTML += `
            <div class="watchlist-card">
                <img src="${movie.Poster}" alt="${movie.Title}">
                <div>
                    <h3>${movie.Title}</h3>
                    <p>${movie.Year}</p>
                    <button class="remove-btn" data-id="${movie.imdbID}">Remove</button>
                </div>
            </div>
        `;
    });
    const removeBtns = document.querySelectorAll(".remove-btn");
    removeBtns.forEach((button) => {
        button.addEventListener("click", () => {
            const movieId = button.dataset.id;
            const movieIndex = watchlist.findIndex((movie) => movie.imdbID === movieId);
            watchlist.splice(movieIndex, 1);
            renderWatchlist();
        });
    });
}

function getMovieDetails(movieId) {
    fetch(`https://www.omdbapi.com/?apikey=YOUR_KEY${movieId}&plot=full`)
        .then(response => response.json())
        .then(movie => {
            if (movie.Response === "False") {
                modalContent.innerHTML = `
                    <button class="close-details" id="closeDetails">×</button>
                    <p class="error-message">Movie details could not be found.</p>
                `;
                movieDetails.classList.add("show");
                addCloseListener();
                return;
            }
            modalContent.innerHTML = `
                <button class="close-details" id="closeDetails">×</button>
                <div class="details-card">
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    <div class="details-info">
                        <h2>${movie.Title}</h2>
                        <p><strong>Year:</strong> ${movie.Year}</p>
                        <p><strong>Genre:</strong> ${movie.Genre}</p>
                        <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Writer:</strong> ${movie.Writer}</p>
                        <p><strong>Actors:</strong> ${movie.Actors}</p>
                        <p><strong>IMDb Rating:</strong> ⭐ ${movie.imdbRating}</p>
                        <p><strong>Country:</strong> ${movie.Country}</p>
                        <p><strong>Awards:</strong> ${movie.Awards}</p>
                        <p class="plot"><strong>Plot:</strong> ${movie.Plot}</p>
                    </div>
                </div>
            `;
            movieDetails.classList.add("show");
            addCloseListener();
        })
        .catch(error => {
            modalContent.innerHTML = `
                <button class="close-details" id="closeDetails">×</button>
                <p class="error-message">Something went wrong while loading the movie details.</p>
            `;
            movieDetails.classList.add("show");
            addCloseListener();
            console.log(error);
        });
}

 function addCloseListener() {
    const closeDetails = document.querySelector("#closeDetails");
    closeDetails.addEventListener("click", () => {
        movieDetails.classList.remove("show");
    });
}

 movieDetails.addEventListener("click", (event) => {
    if (event.target === movieDetails) {
        movieDetails.classList.remove("show");
    }
});

 movieform.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchTerm = movieinp.value.trim();
    if (searchTerm === "") {
        return;
    }
    movieresults.innerHTML = "";
    fetch(`https://www.omdbapi.com/?apikey=YOUR_KEY&s=${searchTerm}`)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "False") {
                movieresults.innerHTML = `
                    <p class="error-message">Movie not found. Please try another title.</p>
                `;
                return;
            }

            data.Search.forEach((movie) => {
                movieresults.innerHTML += `
                    <div class="movie-card">
                        <img src="${movie.Poster}" alt="${movie.Title}">
                        <div class="movie-info">
                            <h2>${movie.Title}</h2>
                            <p>Year: ${movie.Year}</p>
                            <p>Type: ${movie.Type}</p>
                            <button class="details-btn" data-id="${movie.imdbID}">View Details</button>
                            <button class="watchlist-btn" data-id="${movie.imdbID}">Add to Watchlist</button>
                        </div>
                    </div>
                `;
            });

            const detailsBtns = document.querySelectorAll(".details-btn");
            detailsBtns.forEach((button) => {
                button.addEventListener("click", () => {
                    const movieId = button.dataset.id;
                    getMovieDetails(movieId);
                });
            });
            
            const watchlistBtns = document.querySelectorAll(".watchlist-btn");
            watchlistBtns.forEach((button) => {
                button.addEventListener("click", () => {
                    const movieId = button.dataset.id;
                    const selectedMovie = data.Search.find((movie) => movie.imdbID === movieId);
                    const alreadyAdded = watchlist.some((movie) => movie.imdbID === selectedMovie.imdbID);
                    if (!alreadyAdded) {
                        watchlist.push(selectedMovie);
                        localStorage.setItem("watchlist", JSON.stringify(watchlist));
                        renderWatchlist();
                     }
                });
            });
        })
        .catch(error => {
            movieresults.innerHTML = `
                <p class="error-message">Something went wrong. Please try again.</p>
            `;
            console.log(error);
        });
});

renderWatchlist();