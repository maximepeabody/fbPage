# readme

<h1> Description</h1>

Make a website with the contents of a facebook page. Made using angularJS.
We use angular-facebook
to use the facebook api and fetch data from facebook. I use a page factory
to create a single page object containing all the functions and data that a
page may contain. 




<h2> General layout </h2>

The general layout has some of the following sections:
-Home -> either a brief about page with links to other sections, or the
feed. 
-About
-Feed
-Events
-Gallery

<h2> The Page Factory/Singleton</h2>
This factory returns a page object that is used throughout the app. It
serves as the model.
Attributes:
-pageId
-facebookReady: boolean to check if the facebook api is initialized
-tabs: which tabs are being used in the general layout ** maybe rename
sections
-loadMainContent(): calls the facebook api to get the main content. called 
at the start. Alos calls getProfilePicture, getFeed, setCover.
mainContent: 
-name
-profilePicture
-coverURL
-feed
-phone
-about
-emails
-currentLocation
-locations
-description
-companyOverview
-hours
-priceRange




<h3>The Feed</h3>
This is taken directly from the facebook page feed. There are different
types of posts that can be made to the feed. Some examples are pictures, events, or simple messages. 
