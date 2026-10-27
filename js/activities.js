function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	// Count completed activities, includes no distance ones
	const activityCounts = {};

	for (let i = 0; i < tweet_array.length; i++) {
		const tweet = tweet_array[i];

		if (tweet.source === 'completed_event') {
			const activity = tweet.activityType;

			if (activityCounts[activity] === undefined) {
				activityCounts[activity] = 0;
			}
			activityCounts[activity] += 1;
		}
	}

	// Give graph objects containing an activity and its count.
	const activity_data = [];

	for (const activity in activityCounts) {
		activity_data.push({
			activity: activity,
			count: activityCounts[activity]
		});
	}

	// Put largets count first
	activity_data.sort(function(a, b) {
		return b.count - a.count;
	});

	document.getElementById('numberActivities').innerText = activity_data.length;

	// Fill the ranking spans and remember the activity names
	const rankingIDs = ['firstMost', 'secondMost', 'thirdMost'];
	const topActivities = [];

	for (let i = 0; i < rankingIDs.length; i++) {
		if (i < activity_data.length) {
			const activity = activity_data[i].activity;
			topActivities.push(activity);
			document.getElementById(rankingIDs[i]).innerText = activity;
		} else {
			document.getElementById(rankingIDs[i]).innerText = 'N/A';
		}
	}

	const activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "title": "Completed tweets by activity",
	  "width": 600,
	  "height": {"step": 20},
	  "data": {
	    "values": activity_data
	  },
	  //TODO: Add mark and encoding
	  "mark": "bar",
	  "encoding": {
		"x": {
			"field": "count",
			"type": "quantitative",
			"title": "Number of tweets"
		},
		"y": {
			"field": "activity",
			"type": "nominal",
			"sort": "-x",
			"title": "Activity type",
			"axis": {"labelLimit": 300}
		},
		"tooltip": [
			{"field": "activity", "type": "nominal", "title": "Activity"},
			{"field": "count", "type": "quantitative", "title": "Tweets"}
		]
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.

	const days = [
		'Sunday', 'Monday', 'Tuesday', 'Wednesday',
		'Thursday', 'Friday', 'Saturday'
	];

	// Both distance graphs use this set of completed activities
	const distance_data = [];

	for (let i = 0; i < tweet_array.length; i++) {
		const tweet = tweet_array[i];

		if (tweet.source === 'completed_event' && topActivities.includes(tweet.activityType)) {
			const distance = tweet.distance;

			// Skips missing distances instead of counting them as zero
			if (Number.isFinite(distance)) {
				distance_data.push({
					activity: tweet.activityType,
					day: days[tweet.time.getDay()],
					distance: distance
				});
			}
		}
	}

	// Give each activitiy the same color
	const activityColors = {
		"domain": topActivities,
		"range": ['#4c78a8', '#f58518', '#54a24b']
	};

	// One point = one completed activity
	const distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"title": "Individual activity distances",
		"width": 600,
		"height": 350,
		"data": {
			"values": distance_data
		},
		"mark": {
			"type": "circle",
			"opacity": 0.35,
			"size": 25
		},
		"encoding": {
			"x": {
				"field": "day",
				"type": "ordinal",
				"sort": days, 
				"title": "Day of the week",
				"axis": {"labelAngle": 0}
			},
			"y": {
				"field": "distance",
				"type": "quantitative",
				"title": "Distance (miles)"
			},
			"color": {
				"field": "activity",
				"type": "nominal",
				"title": "Activity",
				"scale": activityColors
			},
			"tooltip": [
				{"field": "activity", "type": "nominal", "title": "Activity"},
				{"field": "day", "type": "ordinal", "title": "Day"},
				{"field": "distance", "type": "quantitative", "format": ".2f", "title": "Miles"} 
			]
		}
	};

	// Average for each day and activity
	const distance_vis_aggregated_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"title": "Mean activity distances",
		"width": 600,
		"height": 350,
		"data": {
			"values": distance_data
		},
		"mark": {
			"type": "line",
			"point": true
		},
		"encoding": {
			"x": {
				"field": "day",
				"tyep": "ordinal",
				"sort": days,
				"title": "Day of the week",
				"axis": {"labelAngle": 0}
			},
			"y": {
				"field": "distance",
				"aggregate": "mean",
				"type": "quantitative",
				"title": "Mean distance (miles)"
			},
			"color": {
				"field": "activity",
				"type": "nominal",
				"title": "Activity",
				"scale": activityColors
			},
			"tooltip": [
				{"field": "activity", "type": "nominal", "title": "Activity"},
				{"field": "day", "type": "ordinal", "title": "Day"},
				{"field": "distance", "aggregate": "mean", "type": "quantitative", "format": ".2f", "title": "Mean miles"}
			]
		}
	};

	vegaEmbed('#distanceVis', distance_vis_spec, {action:false});
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, {action:false});

	if (distance_data.length > 0) {
		document.getElementById('longestActivityType').innerText = 'bike';
		document.getElementById('shortestActivityType').innerText = 'walk';
		document.getElementById('weekdayOrWeekendLonger').innerText = 'weekends';
	} else {
		document.getElementById('longestActivityType').innerText = 'N/A';
		document.getElementById('shortestActivityType').innerText = 'N/A';
		document.getElementById('weekdayOrWeekendLonger').innerText = 'N/A';	
	}

	// Start with the individual distances visible and mean hidden
	const distanceVis = document.getElementById('distanceVis');
	const distanceVisAggregated = document.getElementById('distanceVisAggregated');
	const aggregateButton = document.getElementById('aggregate');

	let showingMeans = false;
	distanceVis.style.display = 'block';
	distanceVisAggregated.style.display = 'none';
	aggregateButton.innerText = 'Show mean';

	// Each click switches between which distance is visible 
	aggregateButton.addEventListener('click', function() {
		showingMeans = !showingMeans;

		if (showingMeans) {
			distanceVis.style.display = 'none';
			distanceVisAggregated.style.display = 'block';
			aggregateButton.innerText = 'Show individual activities';
		} else {
			distanceVis.style.display = 'block',
			distanceVisAggregated.style.display = 'none',
			aggregateButton.innerText = 'Show mean'
		}
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});