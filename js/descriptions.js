// Store written tweets so they can be used by the search function
let written_tweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// Convert each saved tweet into an object
	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: Filter to just the written tweets
	written_tweets = tweet_array.filter(function(tweet) {
		return tweet.written;
	});

	// Applies current search after tweets finish loading
	updateSearchResults();
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	const searchBox = document.getElementById('textFilter');

	// The input event handler typing, deleting, and pasting text
	searchBox.addEventListener('input', function (event) {
		updateSearchResults();
	});

	// Start with zero results while the saved tweets load
	updateSearchResults();
}

// Update the search sentence and the table
function updateSearchResults() {
	const searchBox = document.getElementById('textFilter');
	const searchText = searchBox.value;

	// Ignore capitalization and spaces at beginning and end
	const searchTerm = searchText.trim().toLowerCase();

	// Dispplay typed text
	document.getElementById('searchText').textContent = searchText;

	let matchCount = 0;
	let tableRows = '';

	// Keep the table empty when search box is empty
	if (searchTerm.length > 0) {
		for (let i = 0; i < written_tweets.length; i++) {
			const tweet = written_tweets[i];
			const personalText = tweet.writtenText.toLowerCase();

			// Search the personal commentary not the auto generated text
			if (personalText.includes(searchTerm)) {
				matchCount += 1;
				tableRows += tweet.getHTMLTableRow(matchCount);
			}
		}
	}

	document.getElementById('searchCount').textContent = String(matchCount);

	// Replace only the table body
	// Each row comes from getHTMLTableRow()
	document.getElementById('tweetTable').innerHTML = tableRows;
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});