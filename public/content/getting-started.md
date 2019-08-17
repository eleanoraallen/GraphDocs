/* ## SIDEBAR ## --------------------------------------------------------------------------------------------------------------------*/

<Sidebar>
<Logo>https://chargetrip.com/</Logo>
<Line>
<Header>[Getting Started](#getting-started)</Header>
<Header>[Get a Station's Name](#get-a-station-s-name)</Header>
<Header>[Get a Station's Name and Address](#get-a-station-s-name-and-address)</Header>
<Header>[Add a Review to a Station](#add-a-review-to-a-station)</Header>
<Header>[Access a Station's Reviews](#access-a-station-s-reviews)</Header>
<Header>[Update a Station's Reviews](#update-a-station-s-reviews)</Header>
<Header>[Remove a Review from a Station](#remove-a-review-from-a-station)</Header>
<Header>[Check a Station's Reviews Again](#check-a-station-s-reviews-again)</Header>
<Header>[Going Forward](#success-)</Header>
</Sidebar>

/* ## BODY ## -----------------------------------------------------------------------------------------------------------------------*/

<Body>

/* Getting Started ---------------------------------------------------------------------------------------------------------------- */

<Full>

## Getting Started

To utilize the Chargetrip API, you can use the GraphQL query language to make requests from our service. There are three types of operations that can be performed in this way: `query`, `mutation`, and `subscription`, all of which will result in a response in JSON. Queries are used to access information, mutations are used to edit information, and subscriptions are used to fetch data in response to an outside event. Operations are typically used on and/or produce an object. There are five primary types of objects referenced in the API to which clients have access: `Car`, `Operator`, `Route`, `User`, and `Station`, along with several supporting types that are used to model and store information on different things within the API.

</Full>

<Line>

/* Get a Station's Name ----------------------------------------------------------------------------------------------------------- */

<Left>

## Get a Station's Name

Querying information is relatively easy. For example, let's say you want to query the name of a particular station. The following example shows how a developer might request and subsequently receive that information on a specific station from its ID.

</Left> <Right>

<Example>query getStationName {
station(id:"5d131d5d3fa4fe293c7b8d46") {
name
}
}</Example>

</Right>

<Line>

/* Get a Station's Name and Address ------------------------------------------------------------------------------------------------ */

<Left>

## Get a Station's Name and Address

Notice that because we only requested the station's name, that's all we got. This is a feature of all GraphQL APIs; you only ever get what you search for. You can, of course, ask for more information, up to and including the entire object. For example, let's say you wanted not just the name of the station, but its address as well.

</Left> <Right>

<Example>query getStationNameAddress {
station(id:"5d131d5d3fa4fe293c7b8d46") {
name
address {
country
city
street
number
}
}
}</Example>

</Right>

<Line>

/* Add a Review to a Station ------------------------------------------------------------------------------------------------------- */

<Left>

## Add a Review to a Station

Notice that all information is returned in the same order it was requested. Notice also the use of the `Address` sub-object who's parameters needed to be entered in as well for the request to process.
Now let's say that you want to edit the station's reviews. Because we are performing a write operation in addition to a fetch operation, this must be done with a mutation, in this case, addReview.


</Left> <Right>

<Example>query getStationNameAddress {
station(id:"5d131d5d3fa4fe293c7b8d46") {
name
address {
country
city
street
number
}
}
}</Example>

</Right>

<Line>

/* Access A Station's Reviews ----------------------------------------------------------------------------------------------------- */

<Left>

## Access a Station's Reviews

If everything worked accordingly, there should be a new review for that station. We can check to make certain this is the case with another query.

</Left> <Right>

<Example>query getStationReviews {
station(id:"5d131d5d3fa4fe293c7b8d46") {
review {
count
rating
}
}
}</Example>

</Right>

<Line>

/* Update a Station's Reviews ------------------------------------------------------------------------------------------------------ */

<Left>

## Update a Station's Reviews

There should now be one four star review. However, lets say we made a mistake and want to go back and change it. We can do this using the reviews ID and another mutation.

</Left> <Right>

<Example>mutation updateStationReview {
updateReview(
id:"insert review id here"
review: {
rating: 5
message: "I have been edited!"
locale: "I have been edited!"
}
) {
id
}
}</Example>

</Right>

<Line>

/* Remove a Review from a Station -------------------------------------------------------------------------------------------------- */

<Left>

## Remove a Review from a Station

The just entered review, if all went accordingly, is edited now. However, let's say you are super indecisive and want to remove that review: this should not be a problem.

</Left> <Right>

<Example>mutation deleteStationReview {
deleteReview(id:"~INSERT REVIEW ID HERE!~")
}</Example>

</Right>

<Line>

/* Check a Station's Reviews Again ------------------------------------------------------------------------------------------------- */

<Left>

## Check a Station's Reviews Again

Notice that when the only thing returned by an operation is a single Boolean (or another builtin type) we do not have to specify what information we want returned. 
We should have deleted the review now, but let's check one more time to be certain.

</Left> <Right>

<Example>query getStationReviews {
station(id:"5d131d5d3fa4fe293c7b8d46") {
review {
count
rating
}
}
}</Example>

</Right>

<Line>

/* Success ------------------------------------------------------------------------------------------------------------------------- */

<Full>

## Success!

If you understand the actions we just went through, you are probably ready to learn the rest of the API on your own. The rest of the [documentation](/) contains more detailed information on the various things you can do with the API. Feel free to read them and play around in the example windows or in the [playground](https://chargetrip.innobyte.ro/graphql) until you get the hang of it.

</Full>

</Body>
