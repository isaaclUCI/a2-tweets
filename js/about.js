function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// Convert each raw tweet into a Tweet object and store in an array
	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	// Handle an empty dataset
	if (tweet_array.length > 0) {
		let firstDate = tweet_array[0].time;
		let lastDate = tweet_array[0].time;
		
		for (let i = 1; i < tweet_array.length; i++) {
			if (tweet_array[i].time < firstDate) {
				firstDate = tweet_array[i].time;
			}

			if (tweet_array[i].time > lastDate ) {
				lastDate = tweet_array[i].time;
			}
		}

		// Display the weekday, month, day, and year
		const dateOptions = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		};

		document.getElementById('firstDate').innerText = firstDate.toLocaleDateString('en-US', dateOptions);
		document.getElementById('lastDate').innerText = lastDate.toLocaleDateString('en-US', dateOptions);
	} else {
		document.getElementById('firstDate').innerText = 'N/A';
		document.getElementById('lastDate').innerText = 'N/A';
	}

	const counts = {
		completed_event: 0,
		live_event: 0,
		achievement: 0,
		miscellaneous: 0,
	};

	let writtenCount = 0;

	for (let i = 0; i < tweet_array.length; i++) {
		const tweet = tweet_array[i];
		const category = tweet.source;

		counts[category] += 1;

		if (category === 'completed_event' && tweet.written) {
			writtenCount += 1;
		}
	}

	// Update every matching span
	function updateText(selector, value) {
		const elements = document.querySelectorAll(selector);

		for (let i = 0; i < elements.length; i++) {
			elements[i].innerText = value;
		}
	}

	// Show one category count and percentage of all tweets
	function updateCategory(countSelector, percentageSelector, count) {
		let percentage = 0;

		if (tweet_array.length > 0) {
			percentage = (count / tweet_array.length) * 100;
		}

		updateText(countSelector, count);
		updateText(percentageSelector, percentage.toFixed(2) + '%');
	}

	// Display the counts and percentages for each category
	updateCategory('.completedEvents', '.completedEventsPct', counts.completed_event);
	updateCategory('.liveEvents', '.liveEventsPct', counts.live_event);
	updateCategory('.achievements', '.achievementsPct', counts.achievement);
	updateCategory('.miscellaneous', '.miscellaneousPct', counts.miscellaneous);

	// This uses percentage of completed tweets, instead of all tweets, as its total
	let writtenPercentage = 0;

	if (counts.completed_event > 0) {
		writtenPercentage = (writtenCount / counts.completed_event) * 100;
	}

	updateText('.written', writtenCount);
	updateText('.writtenPct', writtenPercentage.toFixed(2) + '%');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});