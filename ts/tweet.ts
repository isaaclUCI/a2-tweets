class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        // Normalize capitalization and spacing of the text before checking for keywords.
        const text = this.text.trim().toLowerCase();

        // Completed activity: "Just completed a 5.00 km run with @Runkeeper! Check it out: http://rnkpr.com/a1b2c3"
        if (text.startsWith('just completed ') || text.startsWith('just posted ')){
            return "completed_event";
        }

        // Live activity: " Watch my live activity on @Runkeeper! http://rnkpr.com/a1b2c3"
        if (text.startsWith('watch my ') && text.includes('runkeeper live')){
            return "live_event";
        }

        // personal records and goals: "I just set a goal"
        if (text.startsWith('achieved a new personal record') || text.startsWith('i just set a goal')){
            return "achievement";
        }

        // If none of the above conditions are met, return 'miscellaneous'
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        // Removes the standard RunKeeper text patterns from the tweet to isolate any personal content.
        return this.getPersonalText().length > 0;
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }

        return this.getPersonalText();
    }
     
    get activityType(): string {
        if (this.source != "completed_event") {
            return "unknown";
        }

        let words = this.text.trim().toLowerCase().split(" ");

        words = words.slice(3); // Remove the first three words: "Just completed a"

        if (words[1] === "km" || words[1] === "mi") {
            words = words.slice(2); // Remove the distance and unit
        }
        
        let activity = words.join(" ");

        activity = activity.split(" - ")[0];
        activity = activity.split(" with ")[0];
        activity = activity.split(" in ")[0];

        return activity.trim();
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        // The distance is typically the fourth word in the tweet text, and the unit is the fifth word.
        const words = this.text.trim().toLowerCase().split(" ");
        const distance = Number(words[3]);
        const unit = words[4];

    
        if ((unit !== "km" && unit !== "mi") || !Number.isFinite(distance)) {
            return NaN; // Return NaN if the unit is not recognized or the distance is not a number
        }

        if (unit === "km") {
            return distance / 1.60934; // Convert kilometers to miles
        }

        return distance; // Return the distance in miles if the unit is already in miles
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        
        // Create the row and its first cell: the result number
        const row = document.createElement('tr');
        const numberCell = document.createElement('td');
        numberCell.textContent = String(rowNumber);
        row.appendChild(numberCell);

        // Create second cell: type of activity
        const activityCell = document.createElement('td');
        activityCell.textContent = this.activityType;
        row.appendChild(activityCell);

        // Create third cell: full tweet and links
        const tweetCell = document.createElement('td');

        // Turn line breaks and tabs into spaces
        let tweetText = this.text;
        tweetText = tweetText.split('\n').join(' ');
        tweetText = tweetText.split('\r').join(' ');
        tweetText = tweetText.split('\t').join(' ');
        const words = tweetText.split(' ');

        for (let i = 0; i < words.length; i++) {
            // Put the spaces back between the words.
            if (i > 0) {
                tweetCell.appendChild(document.createTextNode(' '));
            }

            const word = words[i];
            const lowercaseWord = word.toLocaleLowerCase();

            if (lowercaseWord.startsWith('http://') || lowercaseWord.startsWith('https://')) {
                // Create clickable link using URL in the tweet
                const link = document.createElement('a');
                link.href = word;
                link.textContent = word;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                tweetCell.appendChild(link);
            } else {
                tweetCell.appendChild(document.createTextNode(word));
            }
        } 

        row.appendChild(tweetCell);

        // Return the complete HTML for this row
        return row.outerHTML;
    }

    // Helper to avoid repeating the cleaning logic
    private getPersonalText(): string {

        const separator = " - ";
        const position = this.text.indexOf(separator);

        if (position === -1) {
            return "";
        }

        let comment = this.text.substring(position + separator.length);

        comment = comment.split("\n").join(" ");
        comment = comment.split("\r").join(" ");
        comment = comment.split("\t").join(" ");

        const words = comment.split(" ");
        const personalWords:string[] = [];

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const lowercaseWord = word.trim().toLowerCase();

            // Keep words that are not a link or the auto app hashtag
            if (!lowercaseWord.startsWith("http://") && 
                !lowercaseWord.startsWith("https://") &&
                lowercaseWord !== "#runkeeper") {
                    personalWords.push(word);
                }
            }

            const personalText = personalWords.join(" ").trim();

            if (personalText.toLowerCase() === "tomtom mysports watch") {
                return "";
            }

            return personalText;
        }
}