/* ## SIDEBAR ## --------------------------------------------------------------------------------------------------------------------*/

<Sidebar>
<Logo>https://chargetrip.com/</Logo>
<Line>
</Sidebar>


/* ## BODY ## --------------------------------------------------------------------------------------------------------------------*/
<Body>

</Right> <Left>

### Modifying User Data

There are several mutations that can be used to add, delete, or modify a user's information, all of which can alter only the logged in user's information.
<Example></Example>

<OperationTable include=[user usercar userlocation userinput usercarinput userlocationinput]>Mutation</OperationTable>

</Left> <Right>

#### Example: Add a Location for the Logged in User

<Example>mutation addLocation {
addUserLocation(
location: {
name: generateString(15)
address: generateString(15)
location: {
type:Point
coordinates: [generateFloat(2 6 true), generateFloat(2 6 true)]
}
}) {
id
}
}</Example>

</Right>

</Body>
